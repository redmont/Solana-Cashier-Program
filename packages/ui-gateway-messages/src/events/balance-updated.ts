import { GatewayEvent } from './gateway-event';

export class BalanceUpdatedEvent extends GatewayEvent {
  static messageType = 'event.balanceUpdated';

  constructor(
    public readonly timestamp: string,
    public readonly balance: string,
  ) {
    super();
  }
}
