import { Message } from './message';

export interface GetStreamAuthTokenMessageResponse {
  success: boolean;
  token: string;
}

export class GetStreamAuthTokenMessage extends Message<GetStreamAuthTokenMessageResponse> {
  static messageType = 'getStreamAuthToken';
  constructor() {
    super();
  }
}
