import { Module } from '@nestjs/common';
import { ChainEventsController } from './chainEvents.controller';
import { ChainEventsService } from './chainEvents.service';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [AccountModule],
  providers: [ChainEventsService],
  controllers: [ChainEventsController],
})
export class ChainEventsModule {}
