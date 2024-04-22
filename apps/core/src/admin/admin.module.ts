import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SeriesModule } from 'src/series/series.module';
import { GameServerConfigModule } from 'src/game-server-config/game-server-config.module';

@Module({
  imports: [SeriesModule, GameServerConfigModule],
  controllers: [AdminController],
})
export class AdminModule {}
