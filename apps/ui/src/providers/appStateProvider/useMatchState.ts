import { Bet, Fighter } from '@/types';
import { useEffect } from 'react';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetMatchStatusMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  BetsUpdatedEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';

export interface MatchState {
  fighters: Fighter[];
  bets: Bet[];
  matchId: string;
  series: string;
  state: string;
  preMatchVideoUrl: string;
  startTime?: string;
  winner?: string;
  winAmount?: string;
}

export function useMatchState() {
  const { send, subscribe, connected } = useSocket();

  const [state, patchState, setState] = useDeferredState<MatchState>({
    fighters: [],
    matchId: '',
    series: '',
    state: '',
    preMatchVideoUrl: '',
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
  }, [state, patchState, subscribe]);

  useEffect(() => {
    const subscriptions = [
      subscribe(MatchUpdatedEvent.messageType, (message: MatchUpdatedEvent) => {
        console.log(MatchUpdatedEvent.messageType, message);
        const {
          matchId,
          series,
          state,
          startTime,
          winner,
          timestamp,
          fighters,
        } = message;

        patchState(timestamp, {
          matchId,
          series,
          state,
          startTime,
          winner,
          fighters,
        });
      }),
      subscribe(BetsUpdatedEvent.messageType, (message: BetsUpdatedEvent) => {
        console.log(BetsUpdatedEvent.messageType, message);
        const { bets, timestamp } = message;

        patchState(timestamp || new Date(), { bets });
      }),
      subscribe(MatchResultEvent.messageType, (message: MatchResultEvent) => {
        console.log(MatchResultEvent.messageType, message);
        const { winAmount, timestamp } = message;

        patchState(timestamp, { winAmount });
      }),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [patchState, subscribe]);

  useEffect(() => {
    if (!connected) return;

    send(new GetMatchStatusMessage()).then((matchStatus: unknown) => {
      const {
        matchId,
        series,
        state,
        preMatchVideoUrl,
        startTime,
        winner,
        bets,
        fighters,
      } = matchStatus as typeof GetMatchStatusMessage.responseType;

      setState(new Date(), {
        fighters,
        matchId,
        series,
        state,
        preMatchVideoUrl,
        startTime,
        winner,
        bets,
      });
    });
  }, [connected, send, setState]);

  return state;
}
