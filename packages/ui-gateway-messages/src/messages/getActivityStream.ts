import { Message, MessageResponse } from './message';

export interface GetActivityStreamMessageResponse extends MessageResponse {
  success: boolean;
  messages: { timestamp: string; message: string }[];
}

export class GetActivityStreamMessage extends Message<GetActivityStreamMessageResponse> {
  static messageType = 'getActivityStream';

  static responseType: GetActivityStreamMessageResponse;

  constructor(
    public readonly series: string,
    public readonly matchId: string,
  ) {
    super();
  }
}
