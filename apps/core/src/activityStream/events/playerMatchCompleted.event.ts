import { ActivityEvent } from './activityEvent';

export class PlayerMatchCompletedActivityEvent implements ActivityEvent {
  constructor(
    readonly userId: string,
    readonly xp: number,
  ) {}
}
