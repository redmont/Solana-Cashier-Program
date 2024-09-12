import { Message, MessageResponse } from './message';

export type WithdrawalStatus = 'Pending' | 'Completed' | 'Failed';

export interface GetWithdrawalsMessageResponse extends MessageResponse {
  success: boolean;
  withdrawals: {
    receiptId: string;
    createdAt: string;
    updatedAt: string;
    withdrawnAt?: string;
    creditAmount: number;
    tokenAmount: string;
    tokenSymbol: string;
    tokenDecimals: number;
    transactionHash?: string;
    chainId: string;
    validFrom: string;
    validTo: string;
    status: WithdrawalStatus;
    signature: string;
  }[];
}

export class GetWithdrawalsMessage extends Message<GetWithdrawalsMessageResponse> {
  static messageType = 'getWithdrawals';

  static responseType: GetWithdrawalsMessageResponse;

  constructor() {
    super();
  }
}
