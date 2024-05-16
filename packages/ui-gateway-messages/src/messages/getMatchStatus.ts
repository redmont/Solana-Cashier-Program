import { Message } from './message';

export interface GetMatchStatusMessageResponse {
  success: boolean;
  matchId: string;
  series: string;
  fighters: {
    displayName: string;
    codeName: string;
    ticker: string;
    imageUrl: string;
  }[];
  bets: any[];
  state: string;
  preMatchVideoUrl: string;
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
