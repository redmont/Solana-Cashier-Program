import { Key } from './key.interface';

export interface CurrentMatch extends Key {
  matchId: string;
  seriesCodeName: string;
  fighters: {
    codeName: string;
    displayName: string;
    ticker: string;
    tokenAddress?: string;
    tokenChainId?: string;
    imagePath: string;
  }[];
  state: string;
  preMatchVideoPath: string;
  streamId?: string;
  poolOpenStartTime?: string;
  startTime?: string;
  winner?: string;
  bets: {
    walletAddress: string;
    amount: string;
    fighter: string;
    orderBook: string;
  }[];
  lastUpdated: string;
}
