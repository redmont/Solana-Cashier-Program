import { ServerMessage } from './serverMessage';

export class Error extends ServerMessage {
  constructor() {
    super('error');
  }
}
