import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Actor, createActor } from 'xstate';
import { v4 as uuid } from 'uuid';
import { ResultAsync, fromPromise, errAsync, okAsync } from 'neverthrow';
import {
  MatchCompletedMessage,
  GameServerDisconnectedMessage,
} from 'core-messages';
import { MatchParameters, createGameServerFSM } from './gameServer.fsm';
import { ServerMessage } from './models/serverMessage';
import { ServerCapabilities } from './models/serverCapabilities';
import { MatchOutcome } from './models/matchOutcome';
import { GameServerConfigService } from '../gameServerConfig/gameServerConfig.service';
import { GameServerCapabilitiesService } from '@/gameServerCapabilities/gameServerCapabilities.service';
import { GameServerGateway } from './gameServerGateway';
import { MatchSetup } from './models/matchSetup';
import { GameServerConfig } from '@/gameServerConfig/gameServerConfig.interface';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendBrokerCommand, sendGenericBrokerCommand } from 'broker-comms';
import { StreamUrlService } from './streamUrl.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  private useMockGameServer: boolean;
  public readonly gameServerFSMs: Map<
    string,
    Actor<ReturnType<typeof createGameServerFSM>>
  > = new Map();
  private lastUsedServerId: string | null = null;
  private pendingMessages = new Map<string, Map<string, any>>();

  private sortedServers(): [
    string,
    Actor<ReturnType<typeof createGameServerFSM>>,
  ][] {
    return Array.from(this.gameServerFSMs.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }

  constructor(
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    private readonly gameServerConfigService: GameServerConfigService,
    private readonly gameServerCapabilitiesService: GameServerCapabilitiesService,
    private readonly streamUrlService: StreamUrlService,
    private readonly gameServerGateway: GameServerGateway,
    private readonly broker: NatsJetStreamClientProxy,
  ) {
    this.useMockGameServer =
      this.configService.get<boolean>('useMockGameServer');
  }

  public sendMessage(
    serverId: string,
    payload: any,
  ): ResultAsync<void, string> {
    const messageId = uuid();
    const message = { serverId, payload: { messageId, ...payload } };
    const maxAttempts = 8;

    const attemptSendMessage = (attempt: number = 0): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!this.pendingMessages.has(serverId)) {
          this.pendingMessages.set(serverId, new Map());
        }
        this.pendingMessages.get(serverId).set(messageId, { resolve, reject });

        setTimeout(
          () => {
            if (
              this.pendingMessages.has(serverId) &&
              this.pendingMessages.get(serverId).has(messageId)
            ) {
              this.pendingMessages.get(serverId).delete(messageId);
              if (attempt < maxAttempts) {
                this.logger.warn(`Attempt ${attempt + 1} failed, retrying...`);
                resolve(attemptSendMessage(attempt + 1));
              } else {
                reject('Timeout after 10 retries');
              }
            }
          },
          1.5 ** attempt * 1000,
        );

        try {
          this.gameServerGateway.sendMessageToServer(message);
        } catch (e) {
          reject(e);
        }
      });
    };

    return fromPromise<void, string>(
      attemptSendMessage(0),
      (err: string) => err,
    );
  }

  async handleGameServerMessage(serverId: string, data: any) {
    this.logger.verbose(`Received message from game server`, serverId, data);

    // Handle message acknowledgement
    if (data.type === 'ok') {
      const { messageId } = data;

      const serverPendingMessages = this.pendingMessages.get(serverId);

      const pending = serverPendingMessages.get(messageId);
      if (pending) {
        pending.resolve();
        serverPendingMessages.delete(messageId);
      }
    }

    // Send message acknowledgement
    if (data.messageId && data.type !== 'ok') {
      try {
        await this.gameServerGateway.sendMessageToServer({
          serverId,
          payload: { type: 'ok', messageId: data.messageId },
        });
      } catch (e) {
        this.logger.warn(
          `Failed to send message acknowledgement to server '${serverId}': ${e}`,
        );
      }
    }

    if (data.type === 'ready') {
      const {
        capabilities,
      }: {
        capabilities: ServerCapabilities;
      } = data;

      // Register capabilities
      await this.gameServerCapabilitiesService.register(
        capabilities.models.head,
        capabilities.models.torso,
        capabilities.models.legs,
        capabilities.finishingMoves,
        capabilities.levels,
      );

      const fsm = this.gameServerFSMs.get(serverId);

      if (!fsm) {
        const fsm = createActor(
          createGameServerFSM(
            serverId,
            capabilities,
            async (data: { serverId: string; payload: ServerMessage }) => {},
            // this.sendMessage(data.serverId, data.payload),
            this.broker,
            this.logger,
          ),
        );

        fsm.subscribe((state) => {
          this.logger.log(
            `Server ${serverId} transitioned to state: ${state.value}`,
          );
        });
        fsm.start();

        this.gameServerFSMs.set(serverId, fsm);

        this.logger.log(`Added server ${serverId}`);
      } else {
        fsm.send({ type: 'READY' });

        this.logger.log(`Existing server '${serverId}' is ready`);
      }
    } else if (data.type.toLowerCase() === 'matchfinished') {
      const fsm = this.gameServerFSMs.get(serverId);
      if (fsm) {
        const context = fsm.getSnapshot().context;
        fsm.send({ type: 'MATCH_COMPLETED' });

        this.eventEmitter.emit(
          MatchCompletedMessage.messageType,
          new MatchCompletedMessage(context.matchId),
        );
      }
    }
  }

  async handleServerDisconnect(serverId: string) {
    const fsm = this.gameServerFSMs.get(serverId);
    if (fsm) {
      const context = fsm.getSnapshot().context;
      // There might not be a match ID, if the
      // server was not in the middle of a match.
      if (context?.matchId) {
        this.eventEmitter.emit(
          GameServerDisconnectedMessage.messageType,
          new GameServerDisconnectedMessage(context.matchId),
        );
      }
    }
  }

  async allocateServerForMatch(
    matchId: string,
    matchParameters: MatchParameters,
  ): Promise<{ serverId: string; capabilities: any; streamId: string }> {
    // We're not checking server capabilities yet,
    // so we just return the first server that's ready.

    this.logger.debug(
      `Number of available servers: ${this.gameServerFSMs.size}`,
    );
    const servers = this.sortedServers();
    const serverCount = servers.length;

    if (serverCount === 0) {
      this.logger.warn('No servers available');
      return null;
    }

    let startIndex = 0;

    // Find the starting index based on the last used server ID
    if (this.lastUsedServerId) {
      const lastIndex = servers.findIndex(
        ([key]) => key === this.lastUsedServerId,
      );
      startIndex = lastIndex >= 0 ? (lastIndex + 1) % serverCount : 0;
    }

    for (let i = 0; i < serverCount; i++) {
      const [key, fsm] = servers[(startIndex + i) % serverCount];
      const snapshot = fsm.getSnapshot();

      if (snapshot.value === 'ready') {
        const serverConfig: GameServerConfig = await fromPromise<
          GameServerConfig,
          any
        >(this.gameServerConfigService.get(key), (err) => err).unwrapOr(null);

        if (!serverConfig) {
          this.logger.error(`No config found for server ${key}`);
          continue;
        }

        if (!serverConfig.enabled) {
          this.logger.warn(`Server ${key} is not enabled`);
          continue;
        }

        // The mock game server is not controlled via NATS
        if (!this.useMockGameServer) {
          const streamUrl = await this.streamUrlService.getStreamUrl(
            serverConfig.streamId,
          );
          if (!streamUrl) {
            this.logger.warn(`Failed to get stream URL for server '${key}'`);
            continue;
          }

          try {
            await sendGenericBrokerCommand(
              this.broker,
              `gameEngineControl.${key}`,
              {
                commandName: 'setStreamUrl',
                commandPayload: {
                  streamUrl,
                },
              },
            );
          } catch (e) {
            this.logger.error(
              `Failed to set stream URL for server '${key}'`,
              e,
            );
            continue;
          }
        }

        const { startTime, fighters, level, fightType } = matchParameters;

        const sendMessageResult = await this.sendMessage(
          key,
          new MatchSetup(matchId, startTime, fighters, level, fightType),
        );

        if (!sendMessageResult.isOk()) {
          const err = sendMessageResult.error;
          this.logger.warn(
            `Failed to send match setup message to server '${key}'`,
            err,
          );
          continue;
        }

        fsm.send({
          type: 'MATCH_SETUP_SENT',
          matchId,
        });

        const { streamId } = serverConfig;
        const { capabilities } = snapshot.context;

        this.lastUsedServerId = key;

        return { serverId: key, capabilities, streamId };
      }
    }

    return null;
  }

  setOutcome(
    serverId: string,
    matchId: string,
    outcome: {
      id: number;
      health: number;
      finishingMove: string;
    }[],
  ): ResultAsync<void, string> {
    const fsm = this.gameServerFSMs.get(serverId);
    if (!fsm) {
      const errorMessage = `No FSM found for server ${serverId}`;
      this.logger.error(errorMessage);
      return errAsync(errorMessage);
    }

    // In theory, this should be done after the message is sent.
    // However, message sending can fail, and that should not prevent
    // the FSM from transitioning to the next state.
    fsm.send({ type: 'OUTCOME_SENT' });

    this.sendMessage(serverId, new MatchOutcome(matchId, outcome)).match(
      () => {},
      (err) => {
        this.logger.error(
          `Failed to send outcome message to server '${serverId}'`,
          err,
        );
        fsm.send({ type: 'RESET' });
      },
    );

    return okAsync(undefined);
  }
}
