import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class BetsUpdatedEvent extends BrokerEvent {
  static messageType = `${prefix}.event.betsUpdated`;

  constructor(
    public readonly timestamp: string,
    public readonly seriesCodeName: string,
    public readonly bets: {
      walletAddress: string;
      amount: string;
      fighter: string;
      orderBook: string;
    }[],
  ) {
    super();
  }
}
