import {
  TickerPriceEvent,
  TickerPricesEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Injectable } from '@nestjs/common';
import dayjs from '@/dayjs';
import { Gateway } from '@/gateway';
import { Queue } from './queue';

const cachedTickerSize = 35;

@Injectable()
export class PriceFeedService {
  private cache = new Map<
    string,
    Queue<{
      price: number;
      timestamp: number;
    }>
  >();
  private trackedTickers: { fighter: string; ticker: string }[] = [];

  constructor(private readonly gateway: Gateway) {}

  async handlePriceFeedEvent(symbol: string, price: number, timestamp: number) {
    const symbolLower = symbol.toLowerCase();

    const now = dayjs.utc();
    const ts = dayjs.utc(timestamp);

    // Discard timestamps older than 6 minutes
    if (now.diff(ts, 'minute') > 6) {
      return;
    }

    // Check if the symbol is being tracked
    const trackedTicker = this.trackedTickers.find(
      (t) => t.ticker.toLowerCase() === symbolLower,
    );
    if (trackedTicker) {
      this.gateway.publish(
        new TickerPriceEvent(
          ts.toISOString(),
          trackedTicker.fighter,
          trackedTicker.ticker,
          price,
        ),
      );
    }
    // Check the timestamp in cache. If the cached timestamp is newer, discard the event.
    let cached = this.cache.get(symbolLower);
    if (cached && cached.size > 0 && cached.last.timestamp > timestamp) {
      return;
    }

    if (!cached) {
      this.cache.set(symbolLower, new Queue(cachedTickerSize));
      cached = this.cache.get(symbolLower);
    }

    // Update cache if the timestamp is at least 1 second newer
    if (cached.size === 0 || cached.last.timestamp + 1_000 < timestamp) {
      cached.enqueue({ price, timestamp });
    }
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
          return new TickerPricesEvent(
            cached.asArray().map((c) => ({
              timestamp: dayjs.utc(c.timestamp).toISOString(),
              fighter: t.fighter,
              ticker: t.ticker,
              price: c.price,
            })),
            dayjs.utc().toISOString(),
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
