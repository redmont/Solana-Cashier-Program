import { GatewayEvent } from './gatewayEvent';

export class BalanceUpdatedEvent extends GatewayEvent {
  static messageType = 'event.balanceUpdated';

  constructor(
    public readonly timestamp: string,
    public readonly balance: string,
  ) {
    super();
  }
}
