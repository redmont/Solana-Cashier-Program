import { GatewayEvent } from './gatewayEvent';

export class MatchResultEvent extends GatewayEvent {
  static messageType = 'event.matchResult';

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
