import { Message, MessageResponse } from './message';

export interface SubscribeToOrderBookMessageResponse extends MessageResponse {
  success: boolean;
}

export class SubscribeToOrderBookMessage extends Message<SubscribeToOrderBookMessageResponse> {
  static messageType = 'subscribeToOrderBook';
  constructor(public readonly orderBook: string) {
    super();
  }
}
