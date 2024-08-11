import { Message, MessageResponse } from './message';

export interface GetUserIdMessageResponse extends MessageResponse {
  success: boolean;
  userId: string;
}

export class GetUserIdMessage extends Message<GetUserIdMessageResponse> {
  static messageType = 'getUserId';
  constructor() {
    super();
  }
}
