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

  emitToAll(event: string, data: any) {
    this.clientDiscovery.emitToAll(event, data);
  }

  emitToClient(userId: string, event: string, data: any) {
    if (this.userIdInstances[userId]) {
      this.userIdInstances[userId].forEach((instanceId) => {
        this.clientDiscovery.emitToClient(instanceId, event, data);
      });
    }
  }

  handleMatchUpdated(
    seriesCodeName: string,
    matchId: string,
    fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      imagePath: string;
    }[],
    state: string,
    preMatchVideoPath: string,
    poolOpenStartTime: string,
    startTime: string,
    winner: string,
  ) {
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
        poolOpenStartTime,
        startTime,
        winner,
      ),
    );
  }

  handleBetPlaced(
    userId: string,
    timestamp: string,
    seriesCodeName: string,
    walletAddress: string,
    amount: string,
    fighter: string,
  ) {
    this.emitToClient(
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

  handleBalanceUpdated(userId: string, balance: string) {
    this.emitToClient(
      userId,
      BalanceUpdatedEvent.messageType,
      new BalanceUpdatedEvent(dayjs.utc().toISOString(), userId, balance),
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

  handleActivityStreamItem(userId: string, timestamp: string, message: string) {
    this.emitToClient(
      userId,
      ActivityStreamEvent.messageType,
      new ActivityStreamEvent(timestamp, userId, message),
    );
  }

  handleBetsUpdated(seriesCodeName: string, bets: any[]) {
    this.emitToAll(BetsUpdatedEvent.messageType, {
      timestamp: dayjs.utc().toISOString(),
      seriesCodeName,
      bets,
    });
  }
}
