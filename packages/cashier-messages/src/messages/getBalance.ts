import { BaseResponse, BrokerMessage } from 'broker-comms';
import { prefix } from '../constants';

export type GetBalanceMessageResponse = BaseResponse & {
  balance: number;
};

export class GetBalanceMessage extends BrokerMessage<GetBalanceMessageResponse> {
  static messageType = `${prefix}.getBalance`;
  constructor(public readonly accountId: string) {
    super();
  }
}
