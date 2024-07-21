import { ActivityEvent } from './activityEvent';

export class WinActivityEvent implements ActivityEvent {
  constructor(
    readonly userId: string,
    readonly amount: number,
    readonly fighterDisplayName: string,
  ) {}
}
