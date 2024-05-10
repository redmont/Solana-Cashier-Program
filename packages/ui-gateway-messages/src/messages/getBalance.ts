import { Message } from './message';

export interface GetBalanceMessageResponse {
  success: boolean;
  balance: number;
}

export class GetBalanceMessage extends Message<GetBalanceMessageResponse> {
  static messageType = 'getBalance';
  constructor() {
    super();
  }
}
