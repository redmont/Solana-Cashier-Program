import { Message, MessageResponse } from './message';

export interface GetStreamAuthTokenMessageResponse extends MessageResponse {
  success: boolean;
  token: string;
}

export class GetStreamAuthTokenMessage extends Message<GetStreamAuthTokenMessageResponse> {
  static messageType = 'getStreamAuthToken';
  constructor() {
    super();
  }
}
