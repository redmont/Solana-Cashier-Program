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

import { serverUrl } from '@/config';
import { useWallet } from '@/hooks';

export const socket: Socket = io(serverUrl, {
  transports: ['websocket'],
});

interface SocketContextValue {
  connected: boolean;
  send: <M extends Message, R extends MessageResponse>(
    message: M,
  ) => Promise<R>;
  subscribe: <E extends GatewayEvent>(
    messageType: string,
    handler: (message: E) => void,
  ) => () => void;
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  send: () => {
    throw new Error('Not inside the SocketContext');
  },
  subscribe: () => {
    throw new Error('Not inside the SocketContext');
  },
});

interface MessageConstructor {
  (): Message;
  messageType: string;
}

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
  }, []);

  const send = useCallback(
    <M extends Message, R extends MessageResponse>(message: M) => {
      if (!connected) {
        throw new WebSocketError('Socket is not connected');
      }

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
              new WebSocketError(response.error?.message || 'Unknown error'),
            );
          }
        });
      });
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

export class WebSocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketError';
  }
}
