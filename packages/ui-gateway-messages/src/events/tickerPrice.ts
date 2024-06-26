import { GatewayEvent } from './gatewayEvent';

export class TickerPriceEvent extends GatewayEvent {
  static messageType = 'event.tickerPrice';

  constructor(
    public readonly timestamp: string,
    public readonly fighter: string,
    public readonly ticker: string,
    public readonly price: number,
  ) {
    super();
  }
}
