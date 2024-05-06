import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { WebSocket } from 'ws';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { GameServerService } from './game-server.service';
import { ServerMessage } from './models/server-message';

@WebSocketGateway({
  path: '/game-server',
})
export class GameServerGateway implements OnGatewayDisconnect {
  private logger = new Logger(GameServerGateway.name);
  private serverIdToSocket: Map<string, WebSocket> = new Map();

  @WebSocketServer()
  server: any;

  constructor(private gameServerService: GameServerService) {}

  handleDisconnect(client: any) {
    const serverId = this.getServerIdFromSocket(client);

    this.logger.debug(`Server ${serverId} disconnected`);
    this.serverIdToSocket.delete(serverId);
    this.gameServerService.handleServerDisconnect(serverId);
  }

  private getServerIdFromSocket(socket: WebSocket) {
    let serverId: string;
    this.serverIdToSocket.forEach((value, key) => {
      if (value === socket) {
        serverId = key;
      }
    });
    return serverId;
  }

  // Message type is irrelevant
  // as we're using a custom
  // implementation of the adapter
  @SubscribeMessage('')
  onEvent(client: WebSocket, data: any): Observable<any> {
    let serverId;

    // Send message acknowledgement
    if (data.messageId && data?.type && data.type.toLowerCase() !== 'ok') {
      client.send(JSON.stringify({ type: 'ok', messageId: data.messageId }));
    }

    if (data.type === 'ready') {
      serverId = data.serverId;
      // If we already have the exact same websocket mapped to the serverId,
      // we don't need to do anything.
      // Emphasis on exact same - the same server could reconnect
      // and get a new websocket.
      if (this.serverIdToSocket.get(serverId) === client) {
        return;
      }
      this.serverIdToSocket.set(serverId, client);
    } else {
      // If the message is not a "ready" message,
      // we need to determine the server ID from
      // the connected socket.
      serverId = this.getServerIdFromSocket(client);
    }
    // We discard the serverId from the data
    const { serverId: messageServerId, ...rest } = data;
    this.gameServerService.handleGameServerMessage(serverId, rest);
    return;
  }

  // Event received from the local event bus
  @OnEvent('sendMessageToServer')
  sendMessageToServer<T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }) {
    const { serverId, payload } = data;

    this.logger.verbose(`Sending data to game server`, data);
    const server = this.serverIdToSocket.get(serverId);
    if (server) {
      const messageId = uuid();

      server.send(JSON.stringify({ ...payload, messageId }));
    }
  }
}
