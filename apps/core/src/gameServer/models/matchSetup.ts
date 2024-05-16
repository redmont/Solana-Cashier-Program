import { FightType } from './fightType';
import { ServerMessage } from './serverMessage';

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
    public readonly fightType: FightType,
  ) {
    super('matchSetup');
  }
}
