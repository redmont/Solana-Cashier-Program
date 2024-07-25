import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { WebSocket } from 'ws';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { ServerMessage } from './models/serverMessage';
import { GameServerService } from './gameServer.service';

@WebSocketGateway({
  path: '/game-server',
})
export class GameServerWebSocketGateway implements OnGatewayDisconnect {
  private logger = new Logger(GameServerWebSocketGateway.name);
  private serverIdToSocket: Map<string, WebSocket> = new Map();

  @WebSocketServer()
  server: any;

  constructor(
    @Inject(forwardRef(() => GameServerService))
    private gameServerService: GameServerService,
  ) {}

  handleDisconnect(client: any) {
    const serverId = this.getServerIdFromSocket(client);

    if (serverId) {
      this.logger.debug(`Server ${serverId} disconnected`);
      this.serverIdToSocket.delete(serverId);
      this.gameServerService.handleServerDisconnect(serverId);
    }
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
    let serverId: string;

    const formattedData = { ...data, type: data.type.toLowerCase() };

    if (formattedData.type === 'reconnect') {
      // Server has reconnected, we need to update the socket
      if (this.serverIdToSocket.get(data.serverId) !== client) {
        this.serverIdToSocket.set(data.serverId, client);
      }
    }

    if (formattedData.type === 'ready') {
      serverId = formattedData.serverId;
      // If we already have the exact same websocket mapped to the serverId,
      // we don't need to do anything.
      // Emphasis on exact same - the same server could reconnect
      // and get a new websocket.
      if (this.serverIdToSocket.get(serverId) !== client) {
        this.serverIdToSocket.set(serverId, client);
      }
    } else {
      // If the message is not a "ready" message,
      // we need to determine the server ID from
      // the connected socket.
      serverId = this.getServerIdFromSocket(client);
    }
    // We discard the serverId from the data
    const { serverId: messageServerId, ...rest } = formattedData;
    this.gameServerService.handleGameServerMessage(serverId, rest);
    return;
  }

  public async sendMessageToServer<T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }) {
    const { serverId, payload } = data;

    this.logger.verbose(`Sending data to game server`, data);
    const server = this.serverIdToSocket.get(serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    server.send(JSON.stringify(payload));
  }
}
