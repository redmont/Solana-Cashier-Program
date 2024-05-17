import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class MatchResultEvent extends BrokerEvent {
  static messageType = `${prefix}.event.matchResult`;

  constructor(
    public readonly timestamp: string,
    public readonly matchId: string,
    public readonly betAmount: string,
    public readonly winAmount: string,
    public readonly fighter: string,
  ) {
    super();
  }
}
