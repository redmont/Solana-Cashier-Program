import { Key } from './key.interface';

export interface MatchModel extends Key {
  state: string;
  bets: {
    walletAddress: string;
    amount: string;
  }[];
}
