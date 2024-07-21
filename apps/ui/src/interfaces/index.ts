export interface GetRosterMessageResponse {
  success: boolean;
  roster: {
    series: string;
  }[];
}

export interface GetMatchHistoryMessageResponse {
  [x: string]: any;
  success: boolean;
  matches: {
    seriesCodeName: string;
    matchId: string;
    startTime: string;
    fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      imageUrl: string;
      betCount: number;
    }[];
    winner: {
      codeName: string;
    };
  }[];
}
