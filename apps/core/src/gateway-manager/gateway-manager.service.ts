import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BalanceUpdatedEvent,
  BetPlacedEvent,
  MatchUpdatedEvent,
} from 'core-messages';
import { DateTime } from 'luxon';
import { ClientDiscovery } from './client-discovery';

@Injectable()
export class GatewayManagerService implements OnModuleInit, OnModuleDestroy {
  private clientDiscovery: ClientDiscovery;

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

  emitToClient(userId: string, data: any) {}

  handleMatchUpdated(
    seriesCodeName: string,
    state: string,
    startTime: DateTime,
    winner: string,
  ) {
    console.log("Emitting 'match updated' to all clients", startTime?.toISO());
    const timestamp = DateTime.utc().toISO();

    this.emitToAll(
      MatchUpdatedEvent.messageType,
      new MatchUpdatedEvent(
        timestamp,
        seriesCodeName,
        state,
        startTime?.toISO(),
        winner,
      ),
    );
  }

  handleBetPlaced(
    timestamp: string,
    seriesCodeName: string,
    walletAddress: string,
    amount: string,
    fighter: string,
  ) {
    this.emitToAll(
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
      new BalanceUpdatedEvent(DateTime.utc().toISO(), userId, balance),
    );
  }
}
