export type ServerMessageType = 'ok' | 'matchSetup' | 'matchOutcome';

export class ServerMessage {
  constructor(public readonly type: ServerMessageType) {}
}
