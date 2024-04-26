import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type PlaceBetMessageResponse = BaseResponse;

export class PlaceBetMessage extends BrokerMessage<PlaceBetMessageResponse> {
  static messageType = `${prefix}.placeBet`;
  constructor(
    public readonly seriesCodeName: string,
    public readonly userId: string,
    public readonly walletAddress: string,
    public readonly amount: number,
    public readonly fighter: string,
  ) {
    super();
  }
}
