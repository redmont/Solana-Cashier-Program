export interface GetMatchResult {
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
