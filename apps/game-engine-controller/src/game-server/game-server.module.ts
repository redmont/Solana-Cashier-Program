import { Module } from "@nestjs/common";
import { GameServerService } from "./game-server.service";
import { GameServerController } from "./game-server.controller";

@Module({
  providers: [GameServerService],
  controllers: [GameServerController],
  exports: [GameServerService],
})
export class GameServerModule {}
