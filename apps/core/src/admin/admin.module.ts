import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SeriesModule } from 'src/series/series.module';
import { GameServerConfigModule } from '@/gameServerConfig/gameServerConfig.module';
import { AdminService } from './admin.service';
import { GameServerCapabilitiesModule } from '@/gameServerCapabilities/gameServerCapabilities.module';
import { RosterModule } from '@/roster/roster.module';

@Module({
  imports: [
    SeriesModule,
    GameServerConfigModule,
    GameServerCapabilitiesModule,
    RosterModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
