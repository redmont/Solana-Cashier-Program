import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { GameServerGateway } from './gameServer.gateway';
import { ServerMessage } from './models/serverMessage';

Injectable();
export class GameServerMessageSenderService {
  constructor(
    @Inject(forwardRef(() => GameServerGateway))
    private gameServerGateway: GameServerGateway,
  ) {}

  public sendMessageToServer<T extends ServerMessage>(data: {
    serverId: string;
    payload: T;
  }): Promise<void> {
    return this.gameServerGateway.sendMessageToServer(data);
  }
}
