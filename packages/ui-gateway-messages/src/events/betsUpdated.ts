import { GatewayEvent } from './gatewayEvent';

export class BetsUpdatedEvent extends GatewayEvent {
  static messageType = 'event.betsUpdated';

  constructor(
    public readonly timestamp: string,
    public readonly series: string,
    public readonly bets: {
      walletAddress: string;
      amount: string;
      fighter: string;
    }[],
  ) {
    super();
  }
}
