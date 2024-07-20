import { ActivityEvent } from './activityEvent';

export class MatchCompletedActivityEvent implements ActivityEvent {
  constructor(
    readonly winnerDisplayName: string,
    readonly loserDisplayName: string,
    readonly winnerPriceChange: number,
    readonly loserPriceChange: number,
    readonly prizePool: number,
  ) {}
}
