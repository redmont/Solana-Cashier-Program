import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SeriesModule } from 'src/series/series.module';
import { GameServerConfigModule } from 'src/game-server-config/game-server-config.module';
import { AdminService } from './admin.service';

@Module({
  imports: [SeriesModule, GameServerConfigModule],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
