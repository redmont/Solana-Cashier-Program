import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type CreateWithdrawalMessageResponse = BaseResponse;

interface CreateWithdrawalMessageParams {
  receiptId: string;
  accountId: string;
  chainId: string;
  tokenDecimals: number;
  tokenAmount: string;
  signature: string;
  creditAmount: number;
  createdAt: string;
  validFrom: string;
  validTo: string;
  tokenSymbol?: string;
  tokenAddress?: string;
}

export class CreateWithdrawalMessage extends BrokerMessage<{
  success: boolean;
}> {
  static messageType = `${prefix}.createWithdrawal`;
  constructor(public readonly params: CreateWithdrawalMessageParams) {
    super();
  }
}
