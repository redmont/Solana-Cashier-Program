'use client';

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Socket, io } from 'socket.io-client';
import {
  Message,
  GatewayEvent,
  MessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

import { serverUrl } from '@/config/env';
import { useWallet } from '@/hooks';

export class WebSocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketError';
  }
}

export class WebSocketTimeoutError extends WebSocketError {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketTimeoutError';
  }
}

interface SocketContextValue {
  connected: boolean;
  send: <M extends Message, R extends MessageResponse>(
    message: M,
    retryCount?: number,
    timeoutMs?: number,
  ) => Promise<R>;
  subscribe: <E extends GatewayEvent>(
    messageType: string,
    handler: (message: E) => void,
  ) => () => void;
}

interface MessageConstructor {
  (): Message;
  messageType: string;
}

export const socket: Socket = io(serverUrl, {
  transports: ['websocket'],
});

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  send: () => {
    throw new Error('Not inside the SocketContext');
  },
  subscribe: () => {
    throw new Error('Not inside the SocketContext');
  },
});

const RETRY_DELAY = 1000;
const RETRY_COUNT = 3;
const MESSAGE_TIMEOUT = 5000;

const retry = async <R,>(
  fn: () => Promise<R>,
  retries = RETRY_COUNT,
  delay = RETRY_DELAY,
): Promise<R> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 1) {
      throw err;
    }
    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay * 2); // Exponential backoff
  }
};

const timeout = <R,>(promise: Promise<R>, ms: number): Promise<R> => {
  let timer: NodeJS.Timeout;
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      reject(new WebSocketTimeoutError('Request timed out'));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const SocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const { authToken } = useWallet();

  useEffect(() => {
    socket.auth = { token: authToken ?? null };
    socket.disconnect().connect();

    return () => {
      socket.disconnect();
    };
  }, [authToken]);

  useEffect(() => {
    if (socket.connected) {
      setConnected(true);
    }

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const send = useCallback(
    <M extends Message, R extends MessageResponse>(
      message: M,
      retryCount = RETRY_COUNT,
      timeoutMs = MESSAGE_TIMEOUT,
    ) => {
      if (!connected) {
        throw new WebSocketError('Socket is not connected');
      }

      const sendMessage = () => {
        const { messageType } = message.constructor as MessageConstructor;

        return new Promise<R>((resolve, reject) => {
          socket.emit(messageType, message, (response: R) => {
            if (
              response &&
              typeof response === 'object' &&
              'success' in response &&
              response.success
            ) {
              resolve(response);
            } else {
              reject(
                new WebSocketError(response?.error?.message || 'Unknown error'),
              );
            }
          });
        });
      };

      return retry(() => timeout(sendMessage(), timeoutMs), retryCount);
    },
    [connected],
  );

  const subscribe = useCallback(
    <E extends GatewayEvent>(
      messageType: string,
      handler: (message: E) => void,
    ) => {
      socket.on(messageType, handler);

      return () => socket.off(messageType, handler);
    },
    [],
  );

  return (
    <SocketContext.Provider value={{ connected, send, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
