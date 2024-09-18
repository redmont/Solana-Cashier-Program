import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type EnsureAccountExistsMessageResponse = BaseResponse;

export class EnsureAccountExistsMessage extends BrokerMessage<{
  success: boolean;
}> {
  static messageType = `${prefix}.ensureAccountExists`;
  constructor(
    public readonly accountId: string,
    public readonly primaryWalletAddress: string,
    public readonly initialBalance?: number,
  ) {
    super();
  }
}
