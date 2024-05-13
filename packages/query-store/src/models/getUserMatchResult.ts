export interface GetUserMatchResult {
  seriesCodeName: string;
  matchId: string;
  betAmount: string;
  winAmount: string;
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
