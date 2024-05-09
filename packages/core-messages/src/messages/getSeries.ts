import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type GetSeriesMessageResponse = BaseResponse & {
  series: any[];
};

export class GetSeriesMessage extends BrokerMessage<GetSeriesMessageResponse> {
  static messageType = `${prefix}.getSeries`;
  constructor() {
    super();
  }
}
