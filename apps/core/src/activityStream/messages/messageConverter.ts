import { ActivityEvent } from '../events/activityEvent';

export interface MessageConverter<T extends ActivityEvent> {
  convert(event: T): Promise<{ userId?: string; message: string } | null>;
}
