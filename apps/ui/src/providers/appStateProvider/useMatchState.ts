import { Bet, Fighter } from '@/types';
import { useEffect, useRef } from 'react';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetMatchStatusMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  BetsUpdatedEvent,
  MatchResultEvent,
  TickerPriceEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';
import dayjs from 'dayjs';

type PriceChange = 'up' | 'down' | 'same';

interface Price {
  ticker: string;
  value?: number;
  change?: PriceChange;
}

function getPriceChange(current: number, prev?: number): PriceChange {
  if (prev === undefined || prev === current) return 'same';

  return prev < +current ? 'up' : 'down';
}

export interface MatchState {
  fighters: Fighter[];
  bets: Bet[];
  prices: Record<string, Price>;
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
    prices: {},
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
    const prices: Record<string, Price> = { ...state.prices };

    const subscriptions = [
      subscribe(
        MatchUpdatedEvent.messageType,
        ({ timestamp, matchId }: MatchUpdatedEvent) => {
          if (matchId === state.matchId) return;

          patchState(timestamp, {
            prices: state.fighters.reduce(
              (result, { ticker }) => ({ ...result, [ticker]: { ticker } }),
              {} as Record<string, Price>,
            ),
          });
        },
      ),

      subscribe(TickerPriceEvent.messageType, (message: TickerPriceEvent) => {
        const { ticker, price } = message;

        prices[ticker] = {
          ticker,
          value: price,
          change: getPriceChange(price, prices[ticker]?.value),
        };

        // Add a decent offset so it will set prices once match state is set
        const timestamp = dayjs(message.timestamp).add(1, 'year').toDate();

        patchState(timestamp, {
          prices,
        });
      }),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [state]);

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
        prices: {},
      });
    });
  }, [connected, send, setState]);

  return state;
}
