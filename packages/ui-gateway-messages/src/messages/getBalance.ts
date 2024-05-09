import { Message } from './message';

export interface GetBalanceMessageResponse extends Message {
  balance: number;
}

export class GetBalanceMessage extends Message<{
  balance: number;
  success: boolean;
}> {
  static messageType = 'getBalance';
  constructor() {
    super();
  }
}
