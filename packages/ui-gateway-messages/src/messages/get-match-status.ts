import { Message } from './message';

export class GetMatchStatusMessage extends Message<{
  bets: any[];
  startTime: string;
  state: string;
  success: boolean;
}> {
  static messageType = 'getMatchStatus';
  constructor(public readonly series: string) {
    super();
  }
}
