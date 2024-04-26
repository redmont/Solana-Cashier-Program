import { Module } from '@nestjs/common';
import { GameServerService } from './game-server.service';
import { GameServerGateway } from './game-server.gateway';
import { GameServerConfigModule } from 'src/game-server-config/game-server-config.module';

@Module({
  imports: [GameServerConfigModule],
  providers: [GameServerService, GameServerGateway],
  exports: [GameServerService],
})
export class GameServerModule {}
