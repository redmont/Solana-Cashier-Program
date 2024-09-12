import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type MarkWithdrawalAsCompleteMessageResponse = BaseResponse & {
  message?: string;
};

export class MarkWithdrawalAsCompleteMessage extends BrokerMessage<MarkWithdrawalAsCompleteMessageResponse> {
  static messageType = `${prefix}.markWithdrawalAsComplete`;
  constructor(
    public readonly userId: string,
    public readonly receiptId: string,
    public readonly transactionHash: string,
  ) {
    super();
  }
}
