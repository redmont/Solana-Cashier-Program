import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { GameServerService } from './gameServer.service';
import { ConfigService } from '@nestjs/config';

const serverId = 'mock001';

const readyPayload = {
  type: 'ready',
  version: '0.0.1',
  capabilities: {
    levels: ['level001', 'level002'],
    finishingMoves: [
      'TDA_Uppercut',
      'TDA_Suplex',
      'TDA_RoundKick',
      'TDA_MultiSmash',
      'TDA_Legsweep',
      'TDA_FlyingScissor',
      'TDA_FlyingElbow',
      'TDA_Facepunch',
      'TDA_Dropkick',
      'TDA_Discombobulate',
      'KDA_Punches',
      'KDA_JumpKick',
      'KDA_Headbutts',
    ],
    models: {
      head: ['H_PepeA', 'H_BrawlerA', 'H_BrawlerB', 'H_BrawlerC', 'H_DogeA'],
      torso: ['T_PepeA', 'T_BrawlerA', 'T_BrawlerB', 'T_BrawlerC', 'T_DogeA'],
      legs: ['L_PepeA', 'L_BrawlerA', 'L_BrawlerB', 'L_BrawlerC', 'L_DogeA'],
    },
  },
};

const matchFinishedPayload = {
  type: 'matchFinished',
};

@Injectable()
export class MockGameServer implements OnModuleInit {
  constructor(
    @Inject(forwardRef(() => GameServerService))
    private readonly gameServerService: GameServerService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    if (this.configService.get('useMockGameServer')) {
      this.gameServerService.handleGameServerMessage(serverId, readyPayload);
    }
  }

  async handleMessage(data: { serverId: string; payload: any }) {
    const msg = data.payload;

    if (msg.type !== 'ok') {
      const { messageId } = msg;
      this.gameServerService.handleGameServerMessage(serverId, {
        type: 'ok',
        messageId,
      });
    }

    if (msg.type === 'matchOutcome') {
      // Schedule a match finished message
      setTimeout(() => {
        this.gameServerService.handleGameServerMessage(
          serverId,
          matchFinishedPayload,
        );
      }, 20_000);

      setTimeout(() => {
        this.gameServerService.handleGameServerMessage(serverId, readyPayload);
      }, 25_000);
    }
  }
}
