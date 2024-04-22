import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type RegisterGatewayInstanceResponse = BaseResponse;

export class RegisterGatewayInstanceMessage extends BrokerMessage<RegisterGatewayInstanceResponse> {
  static messageType = `${prefix}.registerGatewayInstance`;
  constructor(public readonly instanceId: string) {
    super();
  }
}
