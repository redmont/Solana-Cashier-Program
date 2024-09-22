import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class BalanceUpdatedEvent extends BrokerEvent {
  static messageType = `${prefix}.event.balanceUpdated`;

  constructor(
    public readonly timestamp: string,
    public readonly userId: string,
    public readonly balance: string,
    public readonly vipBalance: string,
  ) {
    super();
  }
}
