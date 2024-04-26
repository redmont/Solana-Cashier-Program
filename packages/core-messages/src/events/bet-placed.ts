import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class BetPlacedEvent extends BrokerEvent {
  static messageType = `${prefix}.event.betPlaced`;

  constructor(
    public readonly ts: string,
    public readonly seriesCodeName: string,
    public readonly walletAddress: string,
    public readonly amount: string,
    public readonly fighter: string,
  ) {
    super();
  }
}
