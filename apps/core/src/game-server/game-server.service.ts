import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createActor } from 'xstate';
import { createGameServerFSM } from './game-server.fsm';
import { ClientProxy } from '@nestjs/microservices';
import { sendBrokerMessage } from 'broker-comms';
import {
  MatchCompletedMessage,
  MatchCompletedMessageResponse,
  GameServerDisconnectedMessage,
  GameServerDisconnectedMessageResponse,
} from 'core-messages';
import { ServerMessage } from './models/server-message';
import { ServerCapabilities } from './models/server-capabilities';
import { GameServerConfigService } from '../game-server-config/game-server-config.service';

@Injectable()
export class GameServerService {
  private logger = new Logger(GameServerService.name);
  private gameServerFSMs: Map<string, any> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly gameServerConfigService: GameServerConfigService,
  ) {}

  async handleGameServerMessage(serverId: string, data: any) {
    this.logger.verbose(`Received message from game server`, data);

    if (data.type === 'ready') {
      const fsm = this.gameServerFSMs.get(serverId);

      if (!fsm) {
        const {
          capabilities,
        }: {
          capabilities: ServerCapabilities;
        } = data;

        const fsm = createActor(
          createGameServerFSM(
            serverId,
            capabilities,
            (data: { serverId: string; payload: ServerMessage }) =>
              this.eventEmitter.emit('sendMessageToServer', data),
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
    matchParameters: any,
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

  setOutcome(
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

    fsm.send({ type: 'SEND_OUTCOME', params: { outcome } });
  }
}
