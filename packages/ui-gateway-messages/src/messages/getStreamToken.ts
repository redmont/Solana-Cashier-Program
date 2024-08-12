import { Message, MessageResponse } from './message';

export interface GetStreamTokenMessageResponse extends MessageResponse {
  success: boolean;
  token: string;
}

export class GetStreamTokenMessage extends Message<GetStreamTokenMessageResponse> {
  static messageType = 'getStreamToken';
  constructor() {
    super();
  }
}
