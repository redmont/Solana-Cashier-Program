import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type CreateAccountMessageResponse = BaseResponse;

export class CreateAccountMessage extends BrokerMessage<{
  success: boolean;
}> {
  static messageType = `${prefix}.createAccount`;
  constructor(
    public readonly accountId: string,
    public readonly primaryWalletAddress: string,
  ) {
    super();
  }
}
