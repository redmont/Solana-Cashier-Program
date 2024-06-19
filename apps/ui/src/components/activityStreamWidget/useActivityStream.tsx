import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetActivityStreamMessage,
  ActivityStreamEvent,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';
import { useAppState, useEthWallet } from '@/hooks';

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

export function useActivityStream(series?: string, matchId?: string) {
  const { send, subscribe, connected: socketIsConnected } = useSocket();
  const { isConnected: walletIsConnected } = useEthWallet();
  const { match } = useAppState();
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
          console.log(ActivityStreamEvent.messageType, message);

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
  }, [state]);

  useEffect(() => {
    if (!socketIsConnected || !matchId || !series || isReady.current) return;

    send(new GetActivityStreamMessage(series, matchId)).then(
      (response: unknown) => {
        const { messages } =
          response as typeof GetActivityStreamMessage.responseType;

        console.log(GetActivityStreamMessage.messageType, response);

        setState(new Date(), {
          messages: messages.map((m) => ({
            text: m.message,
            timestamp: dayjs(m.timestamp).format('HH:mm:ss'),
          })),
        });

        isReady.current = true;
      },
    );
  }, [socketIsConnected, series, matchId]);

  useEffect(() => {
    if (
      !loginActivityCreated &&
      walletIsConnected &&
      match?.status &&
      isReady.current
    ) {
      const timestamp = new Date();

      if (match?.status === 'bettingOpen') {
        addEphemeralMessage(timestamp, messages.loginBettingOpen);
      }
      if (match?.status === 'matchInProgress') {
        addEphemeralMessage(timestamp, messages.loginMatchInProgress);
      }

      setLoginActivityCreated(true);
    }
  }, [
    loginActivityCreated,
    walletIsConnected,
    match?.status,
    addEphemeralMessage,
  ]);

  useEffect(() => {
    const timestamp = new Date();

    if (match?.status === 'bettingOpen') {
      addEphemeralMessage(timestamp, messages.bettingOpen);
    }
    if (match?.status === 'matchInProgress') {
      addEphemeralMessage(timestamp, messages.matchInProgress);
    }
  }, [match?.status]);

  return state;
}
