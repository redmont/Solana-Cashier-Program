import { BaseResponse, BrokerMessage } from 'broker-comms';
import { prefix } from '../constants';

export type GetAllBalancesMessageResponse = BaseResponse & {
  accounts: {
    accountId: string;
    primaryWalletAddress: string;
    balance: number;
  }[];
};

export class GetAllBalancesMessage extends BrokerMessage<GetAllBalancesMessageResponse> {
  static messageType = `${prefix}.getAllBalances`;
  constructor() {
    super();
  }
}
