import { TickerPriceEvent } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { Injectable } from '@nestjs/common';
import dayjs from '@/dayjs';
import { Gateway } from '@/gateway';

@Injectable()
export class PriceFeedService {
  private trackedTickers: { fighter: string; ticker: string }[] = [];

  private timestamps: {
    [symbol: string]: number;
  } = {};

  constructor(private readonly gateway: Gateway) {}

  async handlePriceFeedEvent(symbol: string, price: number, timestamp: number) {
    console.log('Hnadling price event', symbol, price, timestamp);
    const trackedTicker = this.trackedTickers.find(
      (t) => t.ticker.toLowerCase() === symbol.toLowerCase(),
    );
    if (!trackedTicker) {
      return;
    }

    console.log('Ticker is tracked');

    if (this.timestamps[symbol] && this.timestamps[symbol] > timestamp) {
      return;
    }

    console.log('Timestamp is valid');

    this.timestamps[symbol] = timestamp;

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
  }
}
