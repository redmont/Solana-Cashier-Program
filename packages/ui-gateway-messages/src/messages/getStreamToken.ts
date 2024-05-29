import { Message } from './message';

export interface GetStreamTokenMessageResponse {
  success: boolean;
  token: string;
}

export class GetStreamTokenMessage extends Message<GetStreamTokenMessageResponse> {
  static messageType = 'getStreamToken';
  constructor() {
    super();
  }
}
