import { Key } from './key.interface';

export interface DailyClaimStatus extends Key {
  dailyClaimStreak: number;
  nextClaimDate?: string;
  claimExpiryDate?: string;
}
