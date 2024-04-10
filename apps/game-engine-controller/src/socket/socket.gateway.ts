import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Observable } from "rxjs";
import { WebSocket } from "ws";
import { OnEvent } from "@nestjs/event-emitter";
import { GameServerService } from "src/game-server/game-server.service";

@WebSocketGateway()
export class SocketGateway {
  @WebSocketServer()
  server: any;
  private serverIdToSocket: Map<string, WebSocket> = new Map();

  constructor(private gameServerService: GameServerService) {}

  // Message type is irrelevant
  // as we're using a custom
  // implementation of the adapter
  @SubscribeMessage("")
  onEvent(client: WebSocket, data: any): Observable<any> {
    let serverId;

    if (data.type === "ready") {
      serverId = data.serverId;
      // If we already have the exact same websocket mapped to the serverId,
      // we don't need to do anything.
      // Emphasis on exact same - the same server could reconnect
      // and get a new websocket.
      if (this.serverIdToSocket.get(serverId) === client) {
        return;
      }

      this.serverIdToSocket.set(serverId, client);

      client.on("disconnect", () => {
        this.serverIdToSocket.delete(serverId);
      });
    } else {
      // If the message is not a "ready" message,
      // we need to determine the server ID from
      // the connected socket.
      this.serverIdToSocket.forEach((value, key) => {
        if (value === client) {
          serverId = key;
        }
      });
    }

    // We discard the serverId from the data
    const { serverId: messageServerId, ...rest } = data;

    this.gameServerService.handleGameServerMessage(serverId, rest);
    return data;
  }

  // Event received from the local event bus
  @OnEvent("sendMessageToServer")
  sendMessageToServer(data: { serverId: string; payload: any }) {
    const { serverId, payload } = data;

    const server = this.serverIdToSocket.get(serverId);
    if (server) {
      server.send(JSON.stringify(payload));
    }
  }
}
