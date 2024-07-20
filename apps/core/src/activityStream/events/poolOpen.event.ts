import { ActivityEvent } from './activityEvent';

export class PoolOpenActivityEvent implements ActivityEvent {
  constructor(
    readonly fighter1: {
      codeName: string;
      displayName: string;
    },
    readonly fighter2: {
      codeName: string;
      displayName: string;
    },
  ) {}
}
