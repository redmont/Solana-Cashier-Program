import { Message } from './message';

export interface ClaimDailyClaimMessageResponse {
  success: boolean;
  message?: string;
  data?: {
    streak: number;
    nextClaimDate: string;
    claimExpiryDate: string;
  };
}

export class ClaimDailyClaimMessage extends Message<ClaimDailyClaimMessageResponse> {
  static messageType = 'claimDailyClaim';
  constructor(readonly amount: number) {
    super();
  }
}
