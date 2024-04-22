'use client';

import { Socket, io } from 'socket.io-client';
import { Message, MessageConstructor } from 'ui-gateway-messages';

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3333';

export const socket: Socket = io(URL!, {
  transports: ['websocket'],
});

export class WebSocketError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSocketError';
  }
}

export function sendMessage<T extends Message, TReturnType>(
  socket: Socket,
  message: T,
): Promise<any> {
  const messageType = (message.constructor as any).messageType;

  return new Promise((resolve, reject) => {
    socket.emit(messageType, message, (response: TReturnType) => {
      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success
      ) {
        resolve(response);
      } else {
        reject(
          new WebSocketError(
            (response as any).error?.message || 'Unknown error',
          ),
        );
      }
    });
  });
}
