import { Key } from './key.interface';

export interface CurrentMatch extends Key {
  matchId: string;
  seriesCodeName: string;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    imagePath: string;
  }[];
  state: string;
  startTime?: string;
  winner?: string;
  bets: {
    walletAddress: string;
    amount: string;
    fighter: string;
  }[];
}
