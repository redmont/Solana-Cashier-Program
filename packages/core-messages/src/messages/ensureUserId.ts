import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type EnsureUserIdMessageReturnType = BaseResponse & {
  userId: string;
};

export class EnsureUserIdMessage extends BrokerMessage<EnsureUserIdMessageReturnType> {
  static messageType = `${prefix}.ensureUserId`;

  constructor(
    public walletAddress: string,
    public initialBalance?: number,
  ) {
    super();
  }
}
