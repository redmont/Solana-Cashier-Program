import { Socket as DefaultSocket } from 'socket.io';

export class SocketData {
  ipAddress?: string;
  authorizedUser?: {
    userId: string;
    walletAddress: string;
  };
}

export type Socket = DefaultSocket<any, any, any, SocketData>;
