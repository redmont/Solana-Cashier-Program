import { GatewayEvent } from './gatewayEvent';

export interface TickerPrice {
  timestamp: string;
  fighter: string;
  price: number;
  ticker: string;
}

export class TickerPricesEvent extends GatewayEvent {
  static messageType = 'event.tickerPrices';

  constructor(
    public readonly prices: TickerPrice[],
    public readonly timestamp: string,
  ) {
    super();
  }
}
