import { Key } from 'src/interfaces/key';

export interface UserMatch extends Key {
  userId: string;
  betAmount: string;
  winAmount: string;
  seriesCodeName: string;
  matchId: string;
  startTime: string;
  fighters: {
    displayName: string;
    codeName: string;
    ticker: string;
    imagePath: string;
    betCount: number;
  }[];
  winner: {
    codeName: string;
  };
}
