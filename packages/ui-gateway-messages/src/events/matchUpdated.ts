import { GatewayEvent } from './gatewayEvent';

export class MatchUpdatedEvent extends GatewayEvent {
  static messageType = 'event.matchUpdated';

  constructor(
    public readonly timestamp: string,
    public readonly series: string,
    public readonly matchId: string,
    public readonly state: string,
    public readonly startTime: string,
    public readonly winner: string,
  ) {
    super();
  }
}
