import { ActivityEvent } from './activityEvent';

export class WinXpActivityEvent implements ActivityEvent {
  constructor(
    readonly userId: string,
    readonly amount: number,
  ) {}
}
