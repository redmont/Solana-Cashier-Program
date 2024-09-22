import { ReadModelKey } from './key.interface';

export interface Account extends ReadModelKey {
  primaryWalletAddress: string;
  balance: number;
  vipBalance: number;
  lastUpdated: string;
}
