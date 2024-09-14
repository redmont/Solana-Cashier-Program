import { GatewayEvent } from './gatewayEvent';

export class MatchUpdatedEvent extends GatewayEvent {
  static messageType = 'event.matchUpdated';

  constructor(
    public readonly timestamp: string,
    public readonly series: string,
    public readonly matchId: string,
    public readonly fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      tokenAddress?: string;
      tokenChainId?: string;
      imageUrl: string;
    }[],
    public readonly state: string,
    public readonly preMatchVideoUrl: string,
    public readonly streamId: string,
    public readonly poolOpenStartTime: string,
    public readonly startTime: string,
    public readonly winner: string,
  ) {
    super();
  }
}
