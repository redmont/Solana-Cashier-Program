import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Actor, createActor } from 'xstate';
import { v4 as uuid } from 'uuid';
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

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  private gameServerFSMs: Map<
    string,
    Actor<ReturnType<typeof createGameServerFSM>>
  > = new Map();
  private pendingMessages = new Map<string, Map<string, any>>();

  constructor(
    private eventEmitter: EventEmitter2,
    private readonly gameServerConfigService: GameServerConfigService,
    private readonly gameServerCapabilitiesService: GameServerCapabilitiesService,
    private readonly gameServerGateway: GameServerGateway,
  ) {}

  private async sendMessage(serverId: string, payload: any) {
    const messageId = uuid();
    const message = { serverId, payload: { messageId, ...payload } };

    const attemptSendMessage = (attempt: number): Promise<void> => {
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
              if (attempt < 8) {
                this.logger.warn(`Attempt ${attempt + 1} failed, retrying...`);
                resolve(attemptSendMessage(attempt + 1));
              } else {
                reject('Timeout after 10 retries');
              }
            }
          },
          1.5 ** attempt * 1000,
        );

        this.gameServerGateway.sendMessageToServer(message);
      });
    };

    return attemptSendMessage(0);
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
      this.gameServerGateway.sendMessageToServer({
        serverId,
        payload: { type: 'ok', messageId: data.messageId },
      });
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
            (data: { serverId: string; payload: ServerMessage }) =>
              this.sendMessage(data.serverId, data.payload),
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

    for (let [key, fsm] of this.gameServerFSMs.entries()) {
      const snapshot = fsm.getSnapshot();

      if (snapshot.value === 'ready') {
        const serverConfig = await this.gameServerConfigService.get(key);
        if (!serverConfig) {
          this.logger.error(`No config found for server ${key}`);
          return null;
        }

        fsm.send({
          type: 'SEND_MATCH_SETUP',
          params: { matchId, matchParameters },
        });

        const { streamId } = serverConfig;

        const { capabilities } = snapshot.context;
        return { serverId: key, capabilities, streamId };
      }
    }

    return null;
  }

  async setOutcome(
    serverId: string,
    matchId: string,
    outcome: {
      id: number;
      health: number;
      finishingMove: string;
    }[],
  ) {
    const fsm = this.gameServerFSMs.get(serverId);
    if (!fsm) {
      this.logger.error(`No FSM found for server ${serverId}`);
      return;
    }

    await this.sendMessage(serverId, new MatchOutcome(matchId, outcome));

    fsm.send({ type: 'OUTCOME_SENT' });
  }
}
