import { Message } from './message';

export interface GetDailyClaimsMessageResponse {
  success: boolean;
  dailyClaimAmounts: number[];
  streak: number;
  nextClaimDate: string;
  claimExpiryDate: string;
}

export class GetDailyClaimsMessage extends Message<GetDailyClaimsMessageResponse> {
  static messageType = 'getDailyClaims';

  static responseType: GetDailyClaimsMessageResponse;

  constructor() {
    super();
  }
}
