import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
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
  BetsUpdatedEvent as BetsUpdatedUiGatewayEvent,
  MatchResultEvent as MatchResultUiGatewayEvent,
  ActivityStreamEvent as ActivityStreamUiGatewayEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Dayjs } from 'dayjs';
import dayjs from '@/dayjs';
import { ConfigService } from '@nestjs/config';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Gateway } from './gateway';
import { GatewayInstanceEventPattern } from './nats/gatewayInstanceEventPattern';

@Controller()
export class AppController {
  private readonly mediaUri: string;
  private lastEventTimestamp: Dayjs;

  constructor(
    private readonly configService: ConfigService,
    private readonly gateway: Gateway,
  ) {
    this.mediaUri = this.configService.get<string>('mediaUri');
  }

  getMediaUrl(path: string) {
    return `${this.mediaUri}/${path}`;
  }

  @GatewayInstanceEventPattern(BetPlacedEvent.messageType)
  onBetPlaced(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: BetPlacedEvent,
  ) {
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

    ctx.message.ack();
  }

  @EventPattern(`${MatchUpdatedEvent.messageType}`)
  onMatchUpdated(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: MatchUpdatedEvent,
  ) {
    const {
      timestamp,
      seriesCodeName,
      matchId,
      state,
      poolOpenStartTime,
      startTime,
      winner,
      preMatchVideoPath,
      streamId,
    } = data;

    const ts = dayjs(timestamp);

    if (ts < this.lastEventTimestamp) {
      console.log('Discarding late event');
      ctx.message.ack();
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
        streamId,
        poolOpenStartTime,
        startTime,
        winner,
      ),
    );

    ctx.message.ack();
  }

  @GatewayInstanceEventPattern(BalanceUpdatedEvent.messageType)
  onBalanceUpdated(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: BalanceUpdatedEvent,
  ) {
    const { timestamp, userId, balance } = data;

    this.gateway.publishToUser(
      userId,
      new BalanceUpdatedUiGatewayEvent(timestamp, balance),
    );

    ctx.message.ack();
  }

  @GatewayInstanceEventPattern(ActivityStreamEvent.messageType)
  onActivityStream(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: ActivityStreamEvent,
  ) {
    const { timestamp, userId, message } = data;

    this.gateway.publishToUser(
      userId,
      new ActivityStreamUiGatewayEvent(timestamp, message),
    );

    ctx.message.ack();
  }

  @EventPattern(BetsUpdatedEvent.messageType)
  onBetsUpdated(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: BetsUpdatedEvent,
  ) {
    const { timestamp, seriesCodeName, bets } = data;

    this.gateway.publish(
      new BetsUpdatedUiGatewayEvent(timestamp, seriesCodeName, bets),
    );

    ctx.message.ack();
  }

  @GatewayInstanceEventPattern(MatchResultEvent.messageType)
  onMatchResult(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: MatchResultEvent,
  ) {
    const { userId, timestamp, matchId, betAmount, winAmount, fighter } = data;

    this.gateway.publishToUser(
      userId,
      new MatchResultUiGatewayEvent(
        timestamp,
        matchId,
        betAmount,
        winAmount,
        fighter,
      ),
    );

    ctx.message.ack();
  }
}
