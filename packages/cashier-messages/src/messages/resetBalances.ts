import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type ResetBalanceMessageResponse = BaseResponse;

export class ResetBalanceMessage extends BrokerMessage<{
  success: boolean;
}> {
  static messageType = `${prefix}.resetBalance`;
  constructor(
    public readonly accountId: string,
    public readonly reason: string,
  ) {
    super();
  }
}
