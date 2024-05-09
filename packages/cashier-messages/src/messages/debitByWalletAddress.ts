import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type DebitByWalletAddressMessageResponse = BaseResponse;

export class DebitByWalletAddressMessage extends BrokerMessage<DebitByWalletAddressMessageResponse> {
  static messageType = `${prefix}.debitByWalletAddress`;
  constructor(
    public readonly walletAddress: string,
    public readonly amount: number,
  ) {
    super();
  }
}
