import { Module } from '@nestjs/common';
import { GameServerWebSocketGateway } from './gameServerWebSocket.gateway';
import { GameServerConfigModule } from '@/gameServerConfig/gameServerConfig.module';
import { GameServerCapabilitiesModule } from '@/gameServerCapabilities/gameServerCapabilities.module';
import { GameServerService } from './gameServer.service';
import { MockGameServer } from './mockGameServer';
import { GameServerGateway } from './gameServerGateway';

@Module({
  imports: [GameServerConfigModule, GameServerCapabilitiesModule],
  providers: [
    GameServerService,
    GameServerGateway,
    GameServerWebSocketGateway,
    MockGameServer,
  ],
  exports: [GameServerService],
})
export class GameServerModule {}
