import { Message } from './message';

export interface ChatAuthMessageResponse {
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
