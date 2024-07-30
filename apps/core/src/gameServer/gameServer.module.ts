import { Module } from '@nestjs/common';
import { GameServerWebSocketGateway } from './gameServerWebSocket.gateway';
import { GameServerConfigModule } from '@/gameServerConfig/gameServerConfig.module';
import { GameServerCapabilitiesModule } from '@/gameServerCapabilities/gameServerCapabilities.module';
import { GameServerService } from './gameServer.service';
import { MockGameServer } from './mockGameServer';
import { GameServerGateway } from './gameServerGateway';
import { HttpModule } from '@nestjs/axios';
import { StreamUrlService } from './streamUrl.service';

@Module({
  imports: [HttpModule, GameServerConfigModule, GameServerCapabilitiesModule],
  providers: [
    StreamUrlService,
    GameServerService,
    GameServerGateway,
    GameServerWebSocketGateway,
    MockGameServer,
  ],
  exports: [GameServerService],
})
export class GameServerModule {}
