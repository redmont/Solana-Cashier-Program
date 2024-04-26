import { ServerMessage } from './server-message';

export class MatchOutcome extends ServerMessage {
  constructor(
    public readonly matchId: string,
    public readonly outcome: {
      id: number;
      health: number;
      finishingMove: string;
    }[],
  ) {
    super('matchOutcome');
  }
}
