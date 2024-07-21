import { Bet, Fighter } from '@/types';
import { useEffect } from 'react';
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
import { LOCAL_PRICE_CACHE_PERIOD } from '@/config';

interface Price {
  ticker: string;
  value: number;
  change: { ppm: number; absolute: number };
  event: TickerPriceEvent;
  pastEvents: TickerPriceEvent[];
}

function getPriceChange(args: {
  current: TickerPriceEvent;
  prev: TickerPriceEvent;
}): Price['change'] {
  const change = {
    ppm: 0,
    absolute: 0,
  };

  change.absolute = args.current.price - args.prev.price;
  change.ppm = (change.absolute / args.prev.price) * 1_000_000;
  return change;
}

export interface MatchState {
  fighters: Fighter[];
  bets: Bet[];
  prices: Map<string, Price>;
  matchId: string;
  series: string;
  state: string;
  preMatchVideoUrl: string;
  streamId?: string;
  poolOpenStartTime?: string;
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
    prices: new Map(),
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
    const prices = new Map(state.prices);

    const subscriptions = [
      subscribe(
        MatchUpdatedEvent.messageType,
        ({ timestamp, matchId }: MatchUpdatedEvent) => {
          if (matchId === state.matchId) return;

          patchState(timestamp, {
            prices: new Map(),
          });
        },
      ),

      subscribe(TickerPriceEvent.messageType, (message: TickerPriceEvent) => {
        const { ticker, price } = message;

        const thresholdTime = new Date(Date.now() - LOCAL_PRICE_CACHE_PERIOD);

        const pastEvents = prices.get(ticker)?.pastEvents ?? [];

        const eventIndex = pastEvents.findIndex(
          (event) => new Date(event.timestamp) > thresholdTime,
        );
        const filteredEvents =
          eventIndex === -1 ? [] : pastEvents.slice(eventIndex - 1);

        prices.set(ticker, {
          ticker,
          value: price,
          change: getPriceChange({
            current: message,
            prev: pastEvents[0] ?? message,
          }),
          event: message,
          pastEvents: [...filteredEvents, message].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          ),
        });

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
          poolOpenStartTime,
          startTime,
          winner,
          timestamp,
          fighters,
        } = message;

        patchState(timestamp, {
          matchId,
          series,
          state,
          poolOpenStartTime,
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
        state: messageState,
        preMatchVideoUrl,
        streamId,
        poolOpenStartTime,
        startTime,
        winner,
        bets,
        fighters,
      } = matchStatus as typeof GetMatchStatusMessage.responseType;

      const prices = new Map(
        fighters
          .map((fighter) => [fighter.ticker, state.prices.get(fighter.ticker)])
          .filter(([, v]) => v !== undefined) as [string, Price][],
      );

      setState(new Date(), {
        fighters,
        matchId,
        series,
        state: messageState,
        preMatchVideoUrl,
        streamId,
        poolOpenStartTime,
        startTime,
        winner,
        bets,
        prices,
      });
    });
  }, [connected, send, setState]);

  return state;
}
