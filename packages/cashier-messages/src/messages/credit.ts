import { BrokerMessage, BaseResponse } from "broker-comms";
import { prefix } from "../constants";

export type CreditMessageResponse = BaseResponse;

export class CreditMessage extends BrokerMessage<{
  success: boolean;
}> {
  static messageType = `${prefix}.credit`;
  constructor(
    public readonly accountId: string,
    public readonly amount: number
  ) {
    super();
  }
}
