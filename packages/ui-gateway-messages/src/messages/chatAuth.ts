import { Message, MessageResponse } from './message';

export interface ChatAuthMessageResponse extends MessageResponse {
  success: boolean;
  token: string;
  authorizedUuid: string;
  channels: string[];
}

export class ChatAuthMessage extends Message<ChatAuthMessageResponse> {
  static messageType = 'chatAuth';

  static responseType: ChatAuthMessageResponse;

  constructor() {
    super();
  }
}
