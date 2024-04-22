import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BetPlacedEvent, MatchUpdatedEvent } from 'core-messages';
import {
  BetPlacedEvent as BetPlacedUiGatewayEvent,
  MatchUpdatedEvent as MatchUpdatedUiGatewayEvent,
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
}
