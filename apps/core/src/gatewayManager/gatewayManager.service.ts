import { Injectable, OnModuleInit } from '@nestjs/common';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import {
  BalanceUpdatedEvent,
  BetPlacedEvent,
  MatchUpdatedEvent,
  ActivityStreamEvent,
  BetsUpdatedEvent,
} from 'core-messages';
import dayjs from '@/dayjs';
import { ClientDiscovery } from './clientDiscovery';

@Injectable()
export class GatewayManagerService implements OnModuleInit {
  private clientDiscovery: ClientDiscovery;
  private readonly userIdInstances: {
    [userId: string]: string[];
  } = {};

  constructor(private readonly broker: NatsJetStreamClientProxy) {}

  onModuleInit() {
    this.clientDiscovery = new ClientDiscovery(this.broker);
  }

  async emitToAll(event: string, data: any) {
    await this.clientDiscovery.emitToAll(event, data);
  }

  async emitToClient(userId: string, event: string, data: any) {
    if (this.userIdInstances[userId]) {
      await Promise.all(
        this.userIdInstances[userId].map((instanceId) =>
          this.clientDiscovery.emitToClient(instanceId, event, data),
        ),
      );
    }
  }

  handleMatchUpdated({
    seriesCodeName,
    matchId,
    fighters,
    state,
    preMatchVideoPath,
    streamId,
    poolOpenStartTime,
    startTime,
    winner,
  }: {
    seriesCodeName: string;
    matchId: string;
    fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      tokenAddress?: string;
      tokenChainId?: string;
      imagePath: string;
    }[];
    state: string;
    preMatchVideoPath: string;
    streamId: string;
    poolOpenStartTime: string;
    startTime: string;
    winner: string;
  }) {
    const timestamp = dayjs.utc().toISOString();

    this.emitToAll(
      MatchUpdatedEvent.messageType,
      new MatchUpdatedEvent(
        timestamp,
        seriesCodeName,
        matchId,
        fighters,
        state,
        preMatchVideoPath,
        streamId,
        poolOpenStartTime,
        startTime,
        winner,
      ),
    );
  }

  async handleBetPlaced(
    userId: string,
    timestamp: string,
    seriesCodeName: string,
    walletAddress: string,
    amount: string,
    fighter: string,
  ) {
    await this.emitToClient(
      userId,
      BetPlacedEvent.messageType,
      new BetPlacedEvent(
        timestamp,
        seriesCodeName,
        walletAddress,
        amount,
        fighter,
      ),
    );
  }

  async handleBalanceUpdated(
    timestamp: string,
    userId: string,
    balance: string,
  ) {
    await this.emitToClient(
      userId,
      BalanceUpdatedEvent.messageType,
      new BalanceUpdatedEvent(timestamp, userId, balance),
    );
  }

  handleUserConnected(userId: string, instanceId: string) {
    if (!this.userIdInstances[userId]) {
      this.userIdInstances[userId] = [];
    }

    if (!this.userIdInstances[userId].includes(instanceId)) {
      this.userIdInstances[userId].push(instanceId);
    }
  }

  handleUserDisconnected(userId: string, instanceId: string) {
    if (this.userIdInstances[userId]) {
      this.userIdInstances[userId] = this.userIdInstances[userId].filter(
        (id) => id !== instanceId,
      );
    }
  }

  async handleActivityStreamItem(
    userId: string,
    timestamp: string,
    message: string,
  ) {
    await this.emitToClient(
      userId,
      ActivityStreamEvent.messageType,
      new ActivityStreamEvent(timestamp, userId, message),
    );
  }

  async handleBetsUpdated(seriesCodeName: string, bets: any[]) {
    await this.emitToAll(BetsUpdatedEvent.messageType, {
      timestamp: dayjs.utc().toISOString(),
      seriesCodeName,
      bets,
    });
  }
}
