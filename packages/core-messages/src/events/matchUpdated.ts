import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class MatchUpdatedEvent extends BrokerEvent {
  static messageType = `${prefix}.event.matchUpdated`;

  constructor(
    public readonly timestamp: string,
    public readonly seriesCodeName: string,
    public readonly matchId: string,
    public readonly fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      thumbnailUrl: string;
    }[],
    public readonly state: string,
    public readonly startTime: string,
    public readonly winner: string,
  ) {
    super();
  }
}
