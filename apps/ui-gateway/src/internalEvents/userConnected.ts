import { InternalEvent } from './internalEvent';

export const UserConnectedEvent = new InternalEvent<{
  clientId: string;
}>('userConnected');
