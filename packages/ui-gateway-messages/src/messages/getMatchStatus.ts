import { Message, MessageResponse } from './message';

export interface GetMatchStatusMessageResponse extends MessageResponse {
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
  streamId: string;
  poolOpenStartTime?: string;
  startTime?: string;
  winner?: string;
  timestamp: string;
}

export class GetMatchStatusMessage extends Message<GetMatchStatusMessageResponse> {
  static messageType = 'getMatchStatus';

  static responseType: GetMatchStatusMessageResponse;

  constructor() {
    super();
  }
}
