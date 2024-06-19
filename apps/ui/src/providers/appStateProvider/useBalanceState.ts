import { useEffect } from 'react';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetBalanceMessage,
  GetBalanceMessageResponse,
  BalanceUpdatedEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useDeferredState } from '@/hooks/useDeferredState';

export interface BalanceState {
  balance: number;
  isBalanceReady: boolean;
}

export function useBalanceState() {
  const { send, subscribe, connected } = useSocket();

  const [state, patchState, setState] = useDeferredState<BalanceState>({
    balance: 1000,
    isBalanceReady: false,
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

      setState(new Date(), { balance, isBalanceReady: true });
    });

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [connected, patchState, send, setState, subscribe]);

  return state;
}
