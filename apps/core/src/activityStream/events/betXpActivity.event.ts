import { ActivityEvent } from './activityEvent';

export class BetXpActivityEvent implements ActivityEvent {
  constructor(
    readonly userId: string,
    readonly amount: number,
  ) {}
}
