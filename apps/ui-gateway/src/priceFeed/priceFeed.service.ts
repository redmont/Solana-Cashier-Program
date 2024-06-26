import { TickerPriceEvent } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Injectable } from '@nestjs/common';
import dayjs from '@/dayjs';
import { Gateway } from '@/gateway';

@Injectable()
export class PriceFeedService {
  private cache = new Map<
    string,
    {
      price: number;
      timestamp: number;
    }
  >();
  private trackedTickers: { fighter: string; ticker: string }[] = [];

  constructor(private readonly gateway: Gateway) {}

  async handlePriceFeedEvent(symbol: string, price: number, timestamp: number) {
    const symbolLower = symbol.toLowerCase();

    // Discard timestamps older than 5 minutes
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return;
    }

    // Check the timestamp in cache. If it's newer, discard the event.
    const cached = this.cache.get(symbolLower);
    if (cached && cached.timestamp > timestamp) {
      return;
    }

    // Update cache
    this.cache.set(symbolLower, {
      price,
      timestamp,
    });

    // Check if the symbol is being tracked
    const trackedTicker = this.trackedTickers.find(
      (t) => t.ticker.toLowerCase() === symbolLower,
    );
    if (!trackedTicker) {
      return;
    }

    this.gateway.publish(
      new TickerPriceEvent(
        dayjs.utc(timestamp).toISOString(),
        trackedTicker.fighter,
        trackedTicker.ticker,
        price,
      ),
    );
  }

  async handleCurrentTickers(tickers: { fighter: string; ticker: string }[]) {
    this.trackedTickers = tickers;

    // Send cache items that match the tracked tickers
    const events = this.createPriceEventsFromCache();
    events.forEach((e) => {
      this.gateway.publish(e);
    });
  }

  createPriceEventsFromCache() {
    return this.trackedTickers
      .map((t) => {
        const cached = this.cache.get(t.ticker.toLowerCase());
        if (cached) {
          return new TickerPriceEvent(
            dayjs.utc(cached.timestamp).toISOString(),
            t.fighter,
            t.ticker,
            cached.price,
          );
        }
      })
      .filter((e) => e);
  }

  /**
   * When a client connects, we need to send them the current tickers.
   * @param clientId WebSocket client ID
   */
  async handleUserConnected(clientId: string) {
    // Send cache items that match the tracked tickers
    const events = this.createPriceEventsFromCache();
    events.forEach((e) => {
      this.gateway.publishToClient(clientId, e);
    });
  }
}
