import { Message, MessageResponse } from './message';

export interface GetBalanceMessageResponse extends MessageResponse {
  success: boolean;
  balance: number;
}

export class GetBalanceMessage extends Message<GetBalanceMessageResponse> {
  static messageType = 'getBalance';
  constructor() {
    super();
  }
}
