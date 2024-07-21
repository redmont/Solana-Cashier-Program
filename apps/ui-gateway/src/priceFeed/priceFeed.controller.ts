import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import { MatchUpdatedEvent } from 'core-messages';
import { PriceFeedEventPayload } from './interfaces/priceFeedEventPayload.interface';
import { PriceFeedService } from './priceFeed.service';
import { UserConnectedEvent } from '@/internalEvents';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';

@Controller()
export class PriceFeedController {
  constructor(private readonly priceFeedService: PriceFeedService) {}

  /*
    oracleIndexer.price.[version].[provider].[provider].[ticker].[quote]
    oracleIndexer.price.2.pyth.pyth.doge.usd
  */
  @EventPattern(`oracleIndexer.price.*.*.*.*.*`)
  async onPriceFeedEvent(
    @Payload() data: PriceFeedEventPayload,
    @Ctx() ctx: NatsJetStreamContext,
  ) {
    const { symbol, price, timestamp } = data;

    // Discard timestamps older than 60 seconds
    if (Date.now() - timestamp > 60 * 1000) {
      ctx.message.ack();
      return;
    }

    await this.priceFeedService.handlePriceFeedEvent(
      symbol.base,
      price,
      timestamp,
    );

    ctx.message.ack();
  }

  @EventPattern(`${MatchUpdatedEvent.messageType}`)
  onMatchUpdated(@Payload() data: MatchUpdatedEvent) {
    const { fighters } = data;

    const tickers = fighters.map((fighter) => ({
      fighter: fighter.codeName,
      ticker: fighter.ticker,
    }));

    this.priceFeedService.handleCurrentTickers(tickers);
  }

  @OnEvent(UserConnectedEvent.type)
  onUserConnected(@Payload() data: typeof UserConnectedEvent.payloadType) {
    this.priceFeedService.handleUserConnected(data.clientId);
  }
}
