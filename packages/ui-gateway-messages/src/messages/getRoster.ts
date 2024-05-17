import { Message } from './message';

export interface GetRosterMessageResponse {
  success: boolean;
  roster: {
    series: string;
  }[];
}

export class GetRosterMessage extends Message<GetRosterMessageResponse> {
  static messageType = 'getRoster';

  static responseType: GetRosterMessageResponse;

  constructor() {
    super();
  }
}
