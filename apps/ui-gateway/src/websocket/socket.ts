import { Socket as DefaultSocket } from 'socket.io';

export class SocketData {
  authorizedUser?: {
    sub: string;
    claims: {
      walletAddress: string;
    };
  };
}

export type Socket = DefaultSocket<any, any, any, SocketData>;
