import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type RequestWithdrawalMessageResponse = BaseResponse & {
  message?: string;
};

export class RequestWithdrawalMessage extends BrokerMessage<RequestWithdrawalMessageResponse> {
  static messageType = `${prefix}.requestWithdrawal`;
  constructor(
    public readonly userId: string,
    public readonly chainId: string,
    public readonly tokenSymbol: string,
    public readonly walletAddress: string,
    public readonly creditAmount: number,
  ) {
    super();
  }
}
