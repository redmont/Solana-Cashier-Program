import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalEvent } from './internalEvent';

export const emitInternalEvent = <T>(
  eventEmitter: EventEmitter2,
  event: InternalEvent<T>,
  payload: T,
) => {
  eventEmitter.emit(event.type, event.new(payload));
};
