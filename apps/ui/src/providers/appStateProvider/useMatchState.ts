import { Bet, Fighter } from '@/types';
import { useEffect, useRef } from 'react';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetMatchStatusMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  BetsUpdatedEvent,
  MatchResultEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';

interface Price {
  ticker: string;
  value: string;
  change: 'up' | 'down' | 'same';
}

function getPriceChange(prev: string, current: string): 'up' | 'down' | 'same' {
  if (+prev === +current) return 'same';

  return +prev < +current ? 'up' : 'down';
}

export interface MatchState {
  fighters: Fighter[];
  bets: Bet[];
  prices: Price[];
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
    prices: [],
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

  const pricePoll = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pricePoll.current) return;

    const { prices } = state;

    pricePoll.current = setTimeout(() => {
      const price1 = Math.random().toFixed(6);
      const price2 = Math.random().toFixed(6);

      patchState(new Date(), {
        prices: [
          {
            ticker: 'DOGE',
            value: price1,
            change: getPriceChange(prices[0]?.value ?? '0', price1),
          },
          {
            ticker: 'PEPE',
            value: price2,
            change: getPriceChange(prices[1]?.value ?? '0', price2),
          },
        ],
      });
    }, 1000);

    return () => {
      pricePoll.current && clearTimeout(pricePoll.current);
      pricePoll.current = null;
    };
  }, [state, patchState]);

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
        prices: [],
      });
    });
  }, [connected, send, setState]);

  return state;
}
