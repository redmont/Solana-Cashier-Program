import { GatewayEvent } from './gatewayEvent';

export class BetPlacedEvent extends GatewayEvent {
  static messageType = 'event.betPlaced';

  constructor(
    public readonly timestamp: string,
    public readonly series: string,
    public readonly walletAddress: string,
    public readonly amount: string,
    public readonly fighter: string,
  ) {
    super();
  }
}
