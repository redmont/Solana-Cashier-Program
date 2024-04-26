export type ServerMessageType = 'matchSetup' | 'matchOutcome';

export class ServerMessage {
  constructor(public readonly type: ServerMessageType) {}
}
