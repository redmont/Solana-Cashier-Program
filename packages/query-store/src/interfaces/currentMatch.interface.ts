import { Key } from './key.interface';

export interface CurrentMatchModel extends Key {
  matchId: string;
  seriesCodeName: string;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    thumbnailUrl: string;
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
