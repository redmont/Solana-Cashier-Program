import { Message } from './message';

export interface GetMatchHistoryMessageResponse {
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

export class GetMatchHistoryMessage extends Message<GetMatchHistoryMessageResponse> {
  static messageType = 'getMatchHistory';

  static responseType: GetMatchHistoryMessageResponse;

  constructor() {
    super();
  }
}
