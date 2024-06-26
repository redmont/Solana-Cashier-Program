import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SeriesModule } from 'src/series/series.module';
import { GameServerConfigModule } from '@/gameServerConfig/gameServerConfig.module';
import { AdminService } from './admin.service';
import { GameServerCapabilitiesModule } from '@/gameServerCapabilities/gameServerCapabilities.module';
import { RosterModule } from '@/roster/roster.module';
import { TournamentModule } from '@/tournament/tournament.module';
import { AuthModule } from '@/auth/auth.module';
import { FighterProfilesModule } from '@/fighterProfiles/fighterProfiles.module';

@Module({
  imports: [
    AuthModule,
    SeriesModule,
    GameServerConfigModule,
    GameServerCapabilitiesModule,
    RosterModule,
    TournamentModule,
    FighterProfilesModule
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
