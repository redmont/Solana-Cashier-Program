import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type SubscribeToOrderBookMessageResponse = BaseResponse & {
  message?: string;
};

export class SubscribeToOrderBookMessage extends BrokerMessage<SubscribeToOrderBookMessageResponse> {
  static messageType = `${prefix}.subscribeToOrderBook`;
  constructor(public readonly orderBook: string) {
    super();
  }
}
