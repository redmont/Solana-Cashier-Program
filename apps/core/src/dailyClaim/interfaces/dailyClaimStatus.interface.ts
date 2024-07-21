import { Key } from '@/interfaces/key';

export interface DailyClaimStatus extends Key {
  dailyClaimStreak: number;
  nextClaimDate?: string;
  claimExpiryDate?: string;
}
