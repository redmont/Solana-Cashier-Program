import { Injectable, Logger } from '@nestjs/common';
import { Actor, createActor } from 'xstate';
import { MatchParameters, createGameServerFSM } from './gameServer.fsm';
import {
  MatchCompletedMessage,
  GameServerDisconnectedMessage,
} from 'core-messages';
import { ServerMessage } from './models/serverMessage';
import { ServerCapabilities } from './models/serverCapabilities';
import { GameServerConfigService } from '../gameServerConfig/gameServerConfig.service';
import { GameServerCapabilitiesService } from '@/gameServerCapabilities/gameServerCapabilities.service';
import { GameServerMessageSenderService } from './gameServerMessageSender.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchOutcome } from './models/matchOutcome';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  private gameServerFSMs: Map<
    string,
    Actor<ReturnType<typeof createGameServerFSM>>
  > = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private readonly gameServerConfigService: GameServerConfigService,
    private readonly gameServerCapabilitiesService: GameServerCapabilitiesService,
    private readonly messageSender: GameServerMessageSenderService,
  ) {}

  async handleGameServerMessage(serverId: string, data: any) {
    this.logger.verbose(`Received message from game server`, data);

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
              this.messageSender.sendMessageToServer(data),
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
    } else if (data.type === 'matchFinished') {
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
  ): Promise<{ serverId: string; capabilities: any; streamUrl: string }> {
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

        this.logger.verbose(`Sending 'matchSetup' message to game server`, {
          matchId,
          matchParameters,
        });
        fsm.send({
          type: 'SEND_MATCH_SETUP',
          params: { matchId, matchParameters },
        });

        const { streamUrl } = serverConfig;

        const { capabilities } = snapshot.context;
        return { serverId: key, capabilities, streamUrl };
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

    await this.messageSender.sendMessageToServer<MatchOutcome>({
      serverId: serverId,
      payload: new MatchOutcome(matchId, outcome),
    });

    fsm.send({ type: 'OUTCOME_SENT' });
  }
}
