import { Message } from './message';

interface GetMatchStatusMessageResponse {
  success: boolean;
  matchId: string;
  series: string;
  fighters: {
    displayName: string;
    codeName: string;
    ticker: string;
    thumbnailUrl: string;
  }[];
  bets: any[];
  state: string;
  startTime?: string;
  winner?: string;
}

export class GetMatchStatusMessage extends Message<GetMatchStatusMessageResponse> {
  static messageType = 'getMatchStatus';

  static responseType: GetMatchStatusMessageResponse;

  constructor() {
    super();
  }
}
