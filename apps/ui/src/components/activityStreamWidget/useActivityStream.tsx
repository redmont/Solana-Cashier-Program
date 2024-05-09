import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetActivityStreamMessage,
  ActivityStreamEvent,
} from 'ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';

export interface ActivityStreamMessage {
  text: string;
  timestamp: string;
}

export interface ActivityStreamData {
  messages: ActivityStreamMessage[];
}

export function useActivityStream(series?: string, matchId?: string) {
  const { send, subscribe, connected } = useSocket();
  const isReady = useRef<boolean>(false);

  const [state, patchState, setState] = useDeferredState<ActivityStreamData>({
    messages: [],
  });

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
    console.log('Get Activity Stream', connected, matchId);
    if (!connected || !matchId || !series || isReady.current) return;

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
  }, [connected, matchId]);

  return state;
}
