import { Module } from '@nestjs/common';
import { GameServerGateway } from './gameServer.gateway';
import { GameServerConfigModule } from '@/gameServerConfig/gameServerConfig.module';
import { GameServerCapabilitiesModule } from '@/gameServerCapabilities/gameServerCapabilities.module';
import { GameServerService } from './gameServer.service';
import { GameServerMessageSenderService } from './gameServerMessageSender.service';

@Module({
  imports: [GameServerConfigModule, GameServerCapabilitiesModule],
  providers: [
    GameServerService,
    GameServerGateway,
    GameServerMessageSenderService,
  ],
  exports: [GameServerService],
})
export class GameServerModule {}
