import { ServerMessage } from './server-message';

export class MatchSetup extends ServerMessage {
  constructor(
    public readonly matchId: string,
    public readonly startTime: string,
    public readonly fighters: {
      id: number;
      model: {
        head: string;
        torso: string;
        legs: string;
      };
      displayName: string;
    }[],
    public readonly level: string,
  ) {
    super('matchSetup');
  }
}
