import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { GameServerService } from "./game-server.service";

interface AllocateServerPayload {
  matchId: string;
  matchConfig: any;
}

@Controller()
export class GameServerController {
  constructor(private gameServerService: GameServerService) {}

  @MessagePattern("game-engine.allocateServer")
  async handleAllocateServer(@Payload() data: AllocateServerPayload) {
    const { serverId } = this.gameServerService.allocateServerForMatch(
      data.matchId,
      data.matchConfig
    );

    return { serverId };
  }
}
