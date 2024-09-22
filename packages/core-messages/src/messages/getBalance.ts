import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type GetBalanceMessageResponse = BaseResponse & {
  balance: number;
  vipBalance: number;
};

export class GetBalanceMessage extends BrokerMessage<GetBalanceMessageResponse> {
  static messageType = `${prefix}.getBalance`;
  constructor(public readonly userId: string) {
    super();
  }
}
