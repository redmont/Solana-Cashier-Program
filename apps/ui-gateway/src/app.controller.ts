import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ActivityStreamEvent,
  BalanceUpdatedEvent,
  BetPlacedEvent,
  MatchUpdatedEvent,
} from 'core-messages';
import {
  BetPlacedEvent as BetPlacedUiGatewayEvent,
  MatchUpdatedEvent as MatchUpdatedUiGatewayEvent,
  BalanceUpdatedEvent as BalanceUpdatedUiGatewayEvent,
  ActivityStreamEvent as ActivityStreamUiGatewayEvent,
} from 'ui-gateway-messages';
import { AppGateway } from './app.gateway';
import { DateTime } from 'luxon';

@Controller()
export class AppController {
  private lastEventTimestamp: DateTime;

  constructor(private readonly gateway: AppGateway) {}

  @EventPattern(BetPlacedEvent.messageType)
  onBetPlaced(@Payload() data: BetPlacedEvent) {
    const { ts, seriesCodeName, walletAddress, amount, fighter } = data;

    this.gateway.publish(
      new BetPlacedUiGatewayEvent(
        ts,
        seriesCodeName,
        walletAddress,
        amount,
        fighter,
      ),
    );
  }

  @EventPattern(MatchUpdatedEvent.messageType)
  onMatchUpdated(@Payload() data: MatchUpdatedEvent) {
    const { timestamp, seriesCodeName, state, startTime, winner } = data;

    const ts = DateTime.fromISO(timestamp);

    if (ts < this.lastEventTimestamp) {
      console.log('Discarding late event');
      return;
    }

    this.lastEventTimestamp = ts;

    console.log("Got 'match updated' event");

    this.gateway.publish(
      new MatchUpdatedUiGatewayEvent(
        timestamp,
        seriesCodeName,
        state,
        startTime,
        winner,
      ),
    );
  }

  @EventPattern(BalanceUpdatedEvent.messageType)
  onBalanceUpdated(@Payload() data: BalanceUpdatedEvent) {
    const { timestamp, userId, balance } = data;

    console.log("Got 'balance updated' event", userId, balance);

    this.gateway.publishToUser(
      userId,
      new BalanceUpdatedUiGatewayEvent(timestamp, balance),
    );
  }

  @EventPattern(ActivityStreamEvent.messageType)
  onActivityStream(@Payload() data: ActivityStreamEvent) {
    const { timestamp, userId, message } = data;

    this.gateway.publishToUser(
      userId,
      new ActivityStreamUiGatewayEvent(timestamp, message),
    );
  }
}
