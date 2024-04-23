import { Key } from './key.interface';

export interface SeriesModel extends Key {
  matchId: string;
  state: string;
  startTime?: string;
  winner?: string;
  bets: {
    walletAddress: string;
    amount: string;
    fighter: string;
  }[];
}
