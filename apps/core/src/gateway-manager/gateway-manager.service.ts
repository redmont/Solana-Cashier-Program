import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BalanceUpdatedEvent,
  BetPlacedEvent,
  MatchUpdatedEvent,
  ActivityStreamEvent,
  BetsUpdatedEvent,
} from 'core-messages';
import { DateTime } from 'luxon';
import { ClientDiscovery } from './client-discovery';

@Injectable()
export class GatewayManagerService implements OnModuleInit, OnModuleDestroy {
  private clientDiscovery: ClientDiscovery;
  private readonly userIdInstances: {
    [userId: string]: string[];
  } = {};

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.clientDiscovery = new ClientDiscovery(this.config);
  }

  onModuleDestroy() {
    this.clientDiscovery.destroy();
  }

  registerInstance(instanceId: string) {
    this.clientDiscovery.addClient(instanceId);
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
    state: string,
    startTime: DateTime,
    winner: string,
  ) {
    const timestamp = DateTime.utc().toISO();

    this.emitToAll(
      MatchUpdatedEvent.messageType,
      new MatchUpdatedEvent(
        timestamp,
        seriesCodeName,
        matchId,
        state,
        startTime?.toISO(),
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
      new BalanceUpdatedEvent(DateTime.utc().toISO(), userId, balance),
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
      timestamp: DateTime.utc().toISO(),
      seriesCodeName,
      bets,
    });
  }
}
