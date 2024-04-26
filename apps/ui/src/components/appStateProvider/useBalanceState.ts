import { useEffect } from 'react';
import { useSocket } from '../SocketProvider';

import {
  GetBalanceMessage,
  GetBalanceMessageResponse,
  BalanceUpdatedEvent,
} from 'ui-gateway-messages';
import { useDeferredState } from '@/hooks/useDeferredState';

export interface BalanceState {
  balance: number;
}

export function useBalanceState() {
  const { send, subscribe, connected } = useSocket();

  const [state, patchState, setState] = useDeferredState<BalanceState>({
    balance: 0,
  });

  useEffect(() => {
    if (!connected) return;

    const subscriptions = [
      subscribe(
        BalanceUpdatedEvent.messageType,
        ({ balance, timestamp }: BalanceUpdatedEvent) => {
          console.log(BalanceUpdatedEvent.messageType, balance);
          patchState(timestamp, { balance: +balance });
        },
      ),
    ];

    send(new GetBalanceMessage()).then((message: unknown) => {
      const { balance } = message as GetBalanceMessageResponse;

      console.log(GetBalanceMessage.messageType, message);

      setState(new Date(), { balance });
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [connected]);

  return state;
}
