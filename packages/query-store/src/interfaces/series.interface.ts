import { Key } from './key.interface';

export interface SeriesModel extends Key {
  state: string;
  startTime?: string;
  bets: {
    walletAddress: string;
    amount: string;
    fighter: string;
  }[];
}
