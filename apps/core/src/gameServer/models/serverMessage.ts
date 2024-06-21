export type ServerMessageType = 'ok' | 'matchSetup' | 'matchOutcome' | 'error';

export class ServerMessage {
  constructor(public readonly type: ServerMessageType) {}
}
