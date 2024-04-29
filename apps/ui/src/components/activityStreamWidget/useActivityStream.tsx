import { useEffect } from 'react';
import dayjs from 'dayjs';
import { useSocket } from '../../providers/SocketProvider';

import {
  GetActivityStreamMessage,
  ActivityStreamEvent,
} from 'ui-gateway-messages';

import { useDeferredState } from '@/hooks/useDeferredState';
import { matchSeries } from '@/config';

export interface ActivityStreamMessage {
  text: string;
  timestamp: string;
}

export interface ActivityStreamData {
  messages: ActivityStreamMessage[];
}

export function useActivityStream(matchId?: string) {
  const { send, subscribe, connected } = useSocket();

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
    if (!connected || !matchId) return;

    send(new GetActivityStreamMessage(matchSeries, matchId)).then(
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
      },
    );
  }, [connected, matchId]);

  return state;
}
