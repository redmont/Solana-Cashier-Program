import { Module } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import { GameServerGateway } from './game-server.gateway';
import { GameServerConfigModule } from '@/game-server-config/game-server-config.module';
import { GameServerCapabilitiesModule } from '@/game-server-capabilities/game-server-capabilities.module';

@Module({
  imports: [GameServerConfigModule, GameServerCapabilitiesModule],
  providers: [GameServerService, GameServerGateway],
  exports: [GameServerService],
})
export class GameServerModule {}
