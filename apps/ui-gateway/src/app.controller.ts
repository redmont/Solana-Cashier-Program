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
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Dayjs } from 'dayjs';
import dayjs from '@/dayjs';
import { AppGateway } from './app.gateway';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  private readonly mediaUri: string;
  private lastEventTimestamp: Dayjs;

  constructor(
    private readonly configService: ConfigService,
    private readonly gateway: AppGateway,
  ) {
    this.mediaUri = this.configService.get<string>('mediaUri');
  }

  getMediaUrl(path: string) {
    return `${this.mediaUri}/${path}`;
  }

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
      preMatchVideoPath,
    } = data;

    const ts = dayjs(timestamp);

    if (ts < this.lastEventTimestamp) {
      console.log('Discarding late event');
      return;
    }

    this.lastEventTimestamp = ts;

    const fighters = data.fighters.map(({ imagePath, ...rest }) => ({
      ...rest,
      imageUrl: this.getMediaUrl(imagePath),
    }));

    const preMatchVideoUrl =
      preMatchVideoPath?.length > 0 ? this.getMediaUrl(preMatchVideoPath) : '';

    this.gateway.publish(
      new MatchUpdatedUiGatewayEvent(
        timestamp,
        seriesCodeName,
        matchId,
        fighters,
        state,
        preMatchVideoUrl,
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
