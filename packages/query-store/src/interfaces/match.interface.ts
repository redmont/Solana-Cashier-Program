import { Key } from './key.interface';

export interface Match extends Key {
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
  /**
   * Sorted concatenation of the codeNames of the fighters
   */
  matchFighters?: string;
  winner: {
    codeName: string;
  };
}
