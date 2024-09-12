import { Message, MessageResponse } from './message';

export interface RequestWithdrawalMessageResponse extends MessageResponse {
  success: boolean;
}

export class RequestWithdrawalMessage extends Message<RequestWithdrawalMessageResponse> {
  static messageType = 'requestWithdrawal';
  constructor(
    public readonly chainId: string,
    public readonly tokenSymbol: string,
    public readonly walletAddress: string,
    public readonly creditAmount: number,
  ) {
    super();
  }
}
