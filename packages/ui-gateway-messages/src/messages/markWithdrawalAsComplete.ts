import { Message, MessageResponse } from './message';

export interface MarkWithdrawalAsCompleteMessageResponse
  extends MessageResponse {
  success: boolean;
}

export class MarkWithdrawalAsCompleteMessage extends Message<MarkWithdrawalAsCompleteMessageResponse> {
  static messageType = 'markWithdrawalAsComplete';
  constructor(
    public readonly receiptId: string,
    public readonly transactionHash: string,
  ) {
    super();
  }
}
