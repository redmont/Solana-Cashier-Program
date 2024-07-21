import { ActivityEvent } from './activityEvent';

export class MatchCompletedActivityEvent implements ActivityEvent {
  constructor(
    readonly winnerDisplayName: string,
    readonly loserDisplayName: string,
    readonly prizePool: number,
    readonly winnerPriceChange?: number,
    readonly loserPriceChange?: number,
  ) {}
}
