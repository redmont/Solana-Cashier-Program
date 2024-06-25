import { Message } from './message';

export interface GetUserIdMessageResponse {
  success: boolean;
  userId: string;
}

export class GetUserIdMessage extends Message<GetUserIdMessageResponse> {
  static messageType = 'getUserId';
  constructor() {
    super();
  }
}
