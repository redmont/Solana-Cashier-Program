import { Bet } from '@/types';
import { useEffect } from 'react';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetMatchStatusMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  BetsUpdatedEvent,
} from 'ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';
import { matchSeries } from '@/config';

export interface MatchState {
  bets: Bet[];
  matchId: string;
  state: string;
  startTime?: string;
  winner?: string;
}

export function useMatchState() {
  const { send, subscribe, connected } = useSocket();

  const [state, patchState, setState] = useDeferredState<MatchState>({
    matchId: '',
    state: '',
    bets: [],
  });

  useEffect(() => {
    return subscribe(BetPlacedEvent.messageType, (message: BetPlacedEvent) => {
      console.log(BetPlacedEvent.messageType, message);
      const { amount, fighter, walletAddress, timestamp } = message;

      patchState(timestamp || new Date(), {
        bets: [...state.bets, { amount, fighter, walletAddress }],
      });
    });
  }, [state]);

  useEffect(() => {
    const subscriptions = [
      subscribe(MatchUpdatedEvent.messageType, (message: MatchUpdatedEvent) => {
        console.log(MatchUpdatedEvent.messageType, message);
        const { matchId, state, startTime, winner, timestamp } = message;

        patchState(timestamp, { matchId, state, startTime, winner });
      }),
      subscribe(BetsUpdatedEvent.messageType, (message: BetsUpdatedEvent) => {
        console.log(BetsUpdatedEvent.messageType, message);
        const { bets, timestamp } = message;

        patchState(timestamp || new Date(), { bets });
      }),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (!connected) return;

    send(new GetMatchStatusMessage(matchSeries)).then(
      (matchStatus: unknown) => {
        const { matchId, state, startTime, winner, bets } =
          matchStatus as typeof GetMatchStatusMessage.responseType;

        console.log(GetMatchStatusMessage.messageType, matchStatus);

        setState(new Date(), {
          matchId,
          state,
          startTime,
          winner,
          bets,
        });
      },
    );
  }, [connected]);

  return state;
}
