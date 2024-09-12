import { Module } from '@nestjs/common';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { WithdrawalSignerService } from './withdrawalSigner.service';

@Module({
  providers: [WithdrawalsService, WithdrawalSignerService],
  controllers: [WithdrawalsController],
})
export class WithdrawalsModule {}
