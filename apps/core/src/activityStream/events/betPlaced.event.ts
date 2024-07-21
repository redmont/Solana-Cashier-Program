import { ActivityEvent } from './activityEvent';

export class BetPlacedActivityEvent implements ActivityEvent {
  constructor(
    readonly userId: string,
    readonly amount: number,
    readonly fighterDisplayName: string,
  ) {}
}
