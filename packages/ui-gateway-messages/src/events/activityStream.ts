import { GatewayEvent } from './gatewayEvent';

export class ActivityStreamEvent extends GatewayEvent {
  static messageType = 'event.activityStream';

  constructor(
    public readonly timestamp: string,
    public readonly message: string,
  ) {
    super();
  }
}
