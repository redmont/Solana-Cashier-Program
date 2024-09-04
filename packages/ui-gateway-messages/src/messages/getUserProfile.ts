import { Message, MessageResponse } from './message';

export interface GetUserProfileMessageResponse extends MessageResponse {
  success: boolean;
  xp: number;
}

export class GetUserProfileMessage extends Message<GetUserProfileMessageResponse> {
  static messageType = 'getUserProfile';

  static responseType: GetUserProfileMessageResponse;

  constructor() {
    super();
  }
}
