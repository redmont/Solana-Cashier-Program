import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class AccountDebitedEvent extends BrokerEvent {
  static messageType = `${prefix}.event.accountDebited`;

  constructor(
    public readonly timestamp: string,
    public readonly userId: string,
    public readonly amount: string,
    public readonly balance: string,
    public readonly vipBalance: string,
    public readonly reason: string,
  ) {
    super();
  }
}
