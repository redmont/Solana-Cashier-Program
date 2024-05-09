import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ActivityStreamEvent,
  BalanceUpdatedEvent,
  BetPlacedEvent,
  BetsUpdatedEvent,
  MatchResultEvent,
  MatchUpdatedEvent,
} from 'core-messages';
import {
  BetPlacedEvent as BetPlacedUiGatewayEvent,
  MatchUpdatedEvent as MatchUpdatedUiGatewayEvent,
  BalanceUpdatedEvent as BalanceUpdatedUiGatewayEvent,
  ActivityStreamEvent as ActivityStreamUiGatewayEvent,
  BetsUpdatedEvent as BetsUpdatedUiGatewayEvent,
  MatchResultEvent as MatchResultUiGatewayEvent,
} from 'ui-gateway-messages';
import { Dayjs } from 'dayjs';
import dayjs from '@/dayjs';
import { AppGateway } from './app.gateway';

@Controller()
export class AppController {
  private lastEventTimestamp: Dayjs;

  constructor(private readonly gateway: AppGateway) {}

  @EventPattern(BetPlacedEvent.messageType)
  onBetPlaced(@Payload() data: BetPlacedEvent) {
    const { timestamp, seriesCodeName, walletAddress, amount, fighter } = data;

    this.gateway.publish(
      new BetPlacedUiGatewayEvent(
        timestamp,
        seriesCodeName,
        walletAddress,
        amount,
        fighter,
      ),
    );
  }

  @EventPattern(MatchUpdatedEvent.messageType)
  onMatchUpdated(@Payload() data: MatchUpdatedEvent) {
    const {
      timestamp,
      seriesCodeName,
      matchId,
      state,
      startTime,
      winner,
      fighters,
    } = data;

    const ts = dayjs(timestamp);

    if (ts < this.lastEventTimestamp) {
      console.log('Discarding late event');
      return;
    }

    this.lastEventTimestamp = ts;

    this.gateway.publish(
      new MatchUpdatedUiGatewayEvent(
        timestamp,
        seriesCodeName,
        matchId,
        fighters,
        state,
        startTime,
        winner,
      ),
    );
  }

  @EventPattern(BalanceUpdatedEvent.messageType)
  onBalanceUpdated(@Payload() data: BalanceUpdatedEvent) {
    const { timestamp, userId, balance } = data;

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

  @EventPattern(BetsUpdatedEvent.messageType)
  onBetsUpdated(@Payload() data: BetsUpdatedEvent) {
    const { timestamp, seriesCodeName, bets } = data;

    this.gateway.publish(
      new BetsUpdatedUiGatewayEvent(timestamp, seriesCodeName, bets),
    );
  }

  @EventPattern(MatchResultEvent.messageType)
  onMatchResult(@Payload() data: MatchResultEvent) {
    const { timestamp, matchId, betAmount, winAmount, fighter } = data;

    this.gateway.publish(
      new MatchResultUiGatewayEvent(
        timestamp,
        matchId,
        betAmount,
        winAmount,
        fighter,
      ),
    );
  }
}
