import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type DebitMessageResponse = BaseResponse;

export class DebitMessage extends BrokerMessage<DebitMessageResponse> {
  static messageType = `${prefix}.debit`;
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
    public readonly reason: string,
    public readonly vip: boolean,
  ) {
    super();
  }
}
