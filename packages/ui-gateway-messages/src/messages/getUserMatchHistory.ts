import { Message, MessageResponse } from './message';

export interface GetUserMatchHistoryMessageResponse extends MessageResponse {
  success: boolean;
  matches: {
    seriesCodeName: string;
    matchId: string;
    startTime: string;
    betAmount: string;
    winAmount: string;
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

export class GetUserMatchHistoryMessage extends Message<GetUserMatchHistoryMessageResponse> {
  static messageType = 'getUserMatchHistory';

  static responseType: GetUserMatchHistoryMessageResponse;

  constructor() {
    super();
  }
}
