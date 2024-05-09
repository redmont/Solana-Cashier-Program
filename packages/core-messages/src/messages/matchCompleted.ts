import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type MatchCompletedMessageResponse = BaseResponse;

export class MatchCompletedMessage extends BrokerMessage<MatchCompletedMessageResponse> {
  static messageType = `${prefix}.matchCompleted`;
  constructor(public readonly matchId: string) {
    super();
  }
}
