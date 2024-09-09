import { MatchStatusEnum } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useSocket } from '../providers/SocketProvider';

import {
  GetMatchStatusMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  BetsUpdatedEvent,
  MatchResultEvent,
  TickerPriceEvent,
  GetBalanceMessage,
  BalanceUpdatedEvent,
  TickerPricesEvent,
  GetUserIdMessage,
  GetUserIdMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { useSetAtom } from 'jotai';
import {
  betsAtom,
  fightersAtom,
  matchIdAtom,
  matchResultAtom,
  matchSeriesAtom,
  matchStartTimeAtom,
  matchStatusAtom,
  matchWinnerAtom,
  poolOpenStartTimeAtom,
  preMatchVideoUrlAtom,
  streamIdAtom,
  tickersAtom,
} from '@/store/match';
import {
  accountAddressAtom,
  balanceAtom,
  userIdAtom,
  usernameAtom,
} from '@/store/account';
import { useWallet } from '@/hooks/useWallet';
import { shortenAddress } from '@/utils';
const GetBalanceMessageResponseSchema = z.object({
  success: z.literal(true),
  balance: z.number(),
});

const MAX_TICKERS = 10000;

export function useStateSubscriptions() {
  const { address, user, isAuthenticated } = useWallet();
  const { send, subscribe, connected } = useSocket();

  const setAccountAddress = useSetAtom(accountAddressAtom);
  const setUsername = useSetAtom(usernameAtom);
  const setBets = useSetAtom(betsAtom);
  const setMatchId = useSetAtom(matchIdAtom);
  const setTickers = useSetAtom(tickersAtom);
  const setMatchStatus = useSetAtom(matchStatusAtom);
  const setFighters = useSetAtom(fightersAtom);
  const setMatchSeries = useSetAtom(matchSeriesAtom);
  const setPoolStart = useSetAtom(poolOpenStartTimeAtom);
  const setMatchStart = useSetAtom(matchStartTimeAtom);
  const setStreamId = useSetAtom(streamIdAtom);
  const setPrematchVideoUrl = useSetAtom(preMatchVideoUrlAtom);
  const setBalance = useSetAtom(balanceAtom);
  const setMatchWinner = useSetAtom(matchWinnerAtom);
  const setMatchResult = useSetAtom(matchResultAtom);
  const setUserId = useSetAtom(userIdAtom);

  useEffect(() => {
    setAccountAddress(address);
  }, [address, setAccountAddress]);

  useEffect(() => {
    setUsername(
      isAuthenticated ? (user?.username ?? shortenAddress(address ?? '')) : '',
    );
  }, [address, isAuthenticated, setUsername, user?.username]);

  const timestamps = useRef<Map<string, number>>(new Map());
  const timestampIsSubsequent = useCallback(
    (message: string, timestamp: string) => {
      const lastTimestamp = timestamps.current.get(message);
      const currentTimestamp = new Date(timestamp).getTime();

      if (!lastTimestamp || currentTimestamp > lastTimestamp) {
        timestamps.current.set(message, currentTimestamp);
        return true;
      } else {
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    const getUserId = async () => {
      const { userId } = await send<GetUserIdMessage, GetUserIdMessageResponse>(
        new GetUserIdMessage(),
      );
      setUserId(userId);
    };

    if (connected) {
      getUserId();
    }
  }, [connected, send, setUserId]);

  useEffect(
    () =>
      subscribe(BetPlacedEvent.messageType, (message: BetPlacedEvent) => {
        const { amount, fighter, walletAddress, timestamp } = message;

        setBets((prev) => [
          ...prev,
          { amount, fighter, walletAddress, timestamp },
        ]);
      }),
    [subscribe, setBets],
  );

  useEffect(
    () =>
      subscribe(TickerPriceEvent.messageType, (message: TickerPriceEvent) => {
        setTickers((prev) =>
          [...(prev ?? []), message]
            .slice(-MAX_TICKERS)
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            ),
        );
      }),
    [setTickers, subscribe],
  );

  useEffect(
    () =>
      subscribe(TickerPricesEvent.messageType, (message: TickerPricesEvent) => {
        setTickers((prev) =>
          [...(prev ?? []), ...message.prices]
            .slice(-MAX_TICKERS)
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            ),
        );
      }),
    [setTickers, subscribe],
  );

  useEffect(() => {
    if (connected) {
      subscribe(TickerPricesEvent.messageType, (message: TickerPricesEvent) => {
        if (message.prices.length > 0) {
          const lastPrice = message.prices[message.prices.length - 1];
          setTickers((prev) =>
            [...(prev ?? []), lastPrice]
              .slice(-MAX_TICKERS)
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime(),
              ),
          );
        }
      });
    }
  }, [connected, subscribe, setTickers]);

  useEffect(
    () =>
      subscribe(BetsUpdatedEvent.messageType, (message: BetsUpdatedEvent) => {
        if (timestampIsSubsequent(message.timestamp, message.timestamp)) {
          setBets(message.bets);
        }
      }),
    [setBets, subscribe, timestampIsSubsequent],
  );

  useEffect(
    () =>
      subscribe(MatchUpdatedEvent.messageType, (message: MatchUpdatedEvent) => {
        const {
          matchId,
          series,
          state: status,
          poolOpenStartTime,
          startTime,
          winner,
          fighters,
          streamId,
        } = message;
        if (
          timestampIsSubsequent(
            MatchUpdatedEvent.messageType,
            message.timestamp,
          )
        ) {
          setMatchId(matchId);
          setMatchSeries(series);
          setMatchStatus(MatchStatusEnum.parse(status));
          setPoolStart(poolOpenStartTime);
          setMatchStart(startTime);
          setMatchWinner(winner);
          setFighters([fighters[0] ?? null, fighters[1] ?? null]);
          setStreamId(streamId);
        }
      }),
    [
      setFighters,
      setMatchId,
      setMatchSeries,
      setMatchStart,
      setMatchStatus,
      setMatchWinner,
      setPoolStart,
      setStreamId,
      subscribe,
      timestampIsSubsequent,
    ],
  );

  useEffect(
    () =>
      subscribe(MatchResultEvent.messageType, (message: MatchResultEvent) => {
        if (
          timestampIsSubsequent(MatchResultEvent.messageType, message.timestamp)
        ) {
          setMatchResult({
            winner: message.fighter,
            betAmount: message.betAmount,
            matchId: message.matchId,
            winAmount: message.winAmount,
          });
        }
      }),
    [setMatchResult, setMatchWinner, subscribe, timestampIsSubsequent],
  );

  useEffect(
    () =>
      subscribe(
        BalanceUpdatedEvent.messageType,
        ({ balance }: BalanceUpdatedEvent) => {
          if (timestampIsSubsequent(BalanceUpdatedEvent.messageType, balance)) {
            setBalance(+balance);
          }
        },
      ),
    [setBalance, subscribe, timestampIsSubsequent],
  );

  useEffect(() => {
    if (!connected) {
      return;
    }

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
      setMatchId(matchId);
      setMatchSeries(series);
      setMatchStatus(MatchStatusEnum.parse(messageState));
      setPoolStart(poolOpenStartTime ?? null);
      setMatchStart(startTime ?? null);
      setMatchWinner(winner ?? null);
      setBets(bets);
      setFighters([fighters[0] ?? null, fighters[1] ?? null]);
      setStreamId(streamId);
      setPrematchVideoUrl(preMatchVideoUrl);
    });

    send(new GetBalanceMessage()).then((message: unknown) => {
      const response = GetBalanceMessageResponseSchema.parse(message);
      setBalance(response.balance);
    });
  }, [
    connected,
    send,
    setBalance,
    setBets,
    setFighters,
    setMatchId,
    setMatchSeries,
    setMatchStart,
    setMatchStatus,
    setMatchWinner,
    setPoolStart,
    setPrematchVideoUrl,
    setStreamId,
  ]);
}
