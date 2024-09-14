import { Module } from '@nestjs/common';
import { ChainEventsController } from './chainEvents.controller';
import { ChainEventsService } from './chainEvents.service';
import { AccountModule } from 'src/account/account.module';
import { WithdrawalModule } from '@/withdrawal/withdrawal.module';

@Module({
  imports: [AccountModule, WithdrawalModule],
  providers: [ChainEventsService],
  controllers: [ChainEventsController],
})
export class ChainEventsModule {}
