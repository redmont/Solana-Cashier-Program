import { Message, MessageResponse } from './message';

export interface GetRosterMessageResponse extends MessageResponse {
  success: boolean;
  roster: {
    series: string;
    fighters: {
      displayName: string;
      imageUrl: string;
    }[];
  }[];
}

export class GetRosterMessage extends Message<GetRosterMessageResponse> {
  static messageType = 'getRoster';

  static responseType: GetRosterMessageResponse;

  constructor() {
    super();
  }
}
