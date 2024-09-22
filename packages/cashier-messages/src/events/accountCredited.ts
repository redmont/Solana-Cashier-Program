import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class AccountCreditedEvent extends BrokerEvent {
  static messageType = `${prefix}.event.accountCredited`;

  constructor(
    public readonly timestamp: string,
    public readonly userId: string,
    public readonly primaryWalletAddress: string,
    public readonly amount: string,
    public readonly balance: string,
    public readonly vipBalance: string,
    public readonly reason: string,
  ) {
    super();
  }
}
