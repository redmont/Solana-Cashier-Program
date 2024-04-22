import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type SubscribeToSeriesResponse = BaseResponse;

export class SubscribeToSeriesMessage extends BrokerMessage<SubscribeToSeriesResponse> {
  static messageType = `${prefix}.subscribeToSeries`;
  constructor(
    public readonly seriesCodeName: string,
    public readonly clientId: string,
  ) {
    super();
  }
}
