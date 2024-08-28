import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetActivityStreamMessage,
  ActivityStreamEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';
import { useWallet } from '@/hooks';
import { useAtomValue } from 'jotai';
import { matchIdAtom, matchSeriesAtom, matchStatusAtom } from '@/store/match';

export interface ActivityStreamMessage {
  text: string;
  timestamp: string;
}

export interface ActivityStreamData {
  messages: ActivityStreamMessage[];
}

const messages = {
  loginBettingOpen: `Welcome to Brawl3rs! The match pool is open - back your fighter by placing your stakes now!`,
  loginMatchInProgress: `Welcome to Brawl3rs! Fight in progress! Place your stakes in the next round, starting in under 2 minutes. Who's gonna win this round?`,
  bettingOpen: `The match pool is OPEN! Place your stakes and get ready for the showdown!`,
  matchInProgress: `The match pool is CLOSED! The fight kicks off in 10 seconds while we poll our fighters' crypto price moves... #LFG`,
};

export function useActivityStream() {
  const matchSeries = useAtomValue(matchSeriesAtom);
  const matchId = useAtomValue(matchIdAtom);
  const matchStatus = useAtomValue(matchStatusAtom);
  const { send, subscribe, connected: socketIsConnected } = useSocket();
  const { isConnected: walletIsConnected } = useWallet();
  const isReady = useRef<boolean>(false);

  const [state, patchState, setState] = useDeferredState<ActivityStreamData>({
    messages: [],
  });
  const [loginActivityCreated, setLoginActivityCreated] = useState(false);

  const addEphemeralMessage = useCallback(
    (timestamp: Date, text: string) => {
      patchState(timestamp, {
        messages: [
          ...state.messages,
          {
            text,
            timestamp: dayjs(timestamp).format('HH:mm:ss'),
          },
        ],
      });
    },
    [patchState, state.messages],
  );

  useEffect(() => {
    const subscriptions = [
      subscribe(
        ActivityStreamEvent.messageType,
        ({ message, timestamp }: ActivityStreamEvent) => {
          patchState(timestamp, {
            messages: [
              ...state.messages,
              {
                text: message,
                timestamp: dayjs(timestamp).format('HH:mm:ss'),
              },
            ],
          });
        },
      ),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [patchState, state, subscribe]);

  useEffect(() => {
    if (!socketIsConnected || !matchId || !matchSeries || isReady.current) {
      return;
    }

    send(new GetActivityStreamMessage(matchSeries, matchId)).then(
      (response: unknown) => {
        const { messages } =
          response as typeof GetActivityStreamMessage.responseType;

        setState(new Date(), {
          messages: messages.map((m) => ({
            text: m.message,
            timestamp: dayjs(m.timestamp).format('HH:mm:ss'),
          })),
        });

        isReady.current = true;
      },
    );
  }, [socketIsConnected, matchSeries, matchId, send, setState]);

  useEffect(() => {
    if (
      !loginActivityCreated &&
      walletIsConnected &&
      matchStatus &&
      isReady.current
    ) {
      const timestamp = new Date();

      if (matchStatus === 'bettingOpen') {
        addEphemeralMessage(timestamp, messages.loginBettingOpen);
      }
      if (matchStatus === 'matchInProgress') {
        addEphemeralMessage(timestamp, messages.loginMatchInProgress);
      }

      setLoginActivityCreated(true);
    }
  }, [
    loginActivityCreated,
    walletIsConnected,
    addEphemeralMessage,
    matchStatus,
  ]);

  useEffect(() => {
    const timestamp = new Date();

    if (matchStatus === 'bettingOpen') {
      addEphemeralMessage(timestamp, messages.bettingOpen);
    }
    if (matchStatus === 'matchInProgress') {
      addEphemeralMessage(timestamp, messages.matchInProgress);
    }
  }, [addEphemeralMessage, matchStatus]);

  return state;
}
