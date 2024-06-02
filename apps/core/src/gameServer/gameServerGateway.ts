import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { GameServerWebSocketGateway } from './gameServerWebSocket.gateway';
import { ServerMessage } from './models/serverMessage';
import { MockGameServer } from './mockGameServer';

@Injectable()
export class GameServerGateway {
  private readonly logger = new Logger(GameServerGateway.name);

  constructor(
    @Inject(forwardRef(() => GameServerWebSocketGateway))
    private gameServerWebSocketGateway: GameServerWebSocketGateway,
    private mockGameServer: MockGameServer,
  ) {}

  public sendMessageToServer<T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }): Promise<void> {
    this.logger.debug(
      `Sending message to server ${data.serverId}`,
      JSON.stringify(data.payload),
    );

    if (data.serverId === 'mock001') {
      return this.mockGameServer.handleMessage(data);
    }

    return this.gameServerWebSocketGateway.sendMessageToServer(data);
  }
}
