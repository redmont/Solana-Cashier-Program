import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { GameServerModule } from "src/game-server/game-server.module";

@Module({
  imports: [GameServerModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
