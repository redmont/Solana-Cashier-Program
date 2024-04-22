import { BrokerEvent } from 'broker-comms';
import { prefix } from '../constants';

export class ActivityStreamEvent extends BrokerEvent {
  static messageType = `${prefix}.event.activityStream`;

  constructor(
    public readonly timestamp: string,
    public readonly userId: string,
    public readonly message: string,
  ) {
    super();
  }
}
