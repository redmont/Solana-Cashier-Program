import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type CreditByWalletAddressMessageResponse = BaseResponse;

export class CreditByWalletAddressMessage extends BrokerMessage<{
  success: boolean;
}> {
  static messageType = `${prefix}.creditByWalletAddress`;
  constructor(
    public readonly walletAddress: string,
    public readonly amount: number,
  ) {
    super();
  }
}
