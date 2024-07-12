import { BrokerMessage, BaseResponse } from 'broker-comms';
import { prefix } from '../constants';

export type ClaimDailyClaimMessageResponse = BaseResponse & {
  data?: {
    streak: number;
    nextClaimDate: string;
    claimExpiryDate: string;
  };
};

export class ClaimDailyClaimMessage extends BrokerMessage<ClaimDailyClaimMessageResponse> {
  static messageType = `${prefix}.claimDailyClaim`;
  constructor(
    public readonly userId: string,
    public readonly amount: number,
  ) {
    super();
  }
}
