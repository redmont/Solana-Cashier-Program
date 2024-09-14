import { createWithdrawalCommand } from '@/commands';
import { markWithdrawalAsCompleteCommand } from '@/commands/markWithdrawalAsComplete.command';
import { ConnectedEventStore } from '@castore/core';
import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateWithdrawalMessage,
  MarkWithdrawalAsCompleteMessage,
} from 'cashier-messages';

@Controller()
export class WithdrawalController {
  private logger = new Logger(WithdrawalController.name);

  constructor(
    @Inject('AccountsConnectedEventStore')
    private readonly accountsEventStore: ConnectedEventStore,
    @Inject('WithdrawalsConnectedEventStore')
    private readonly withdrawalsEventStore: ConnectedEventStore,
  ) {}

  @MessagePattern({ cmd: CreateWithdrawalMessage.messageType })
  async handleCredit(
    @Payload()
    {
      params: {
        receiptId,
        accountId,
        chainId,
        tokenSymbol,
        tokenAddress,
        tokenDecimals,
        tokenAmount,
        signature,
        creditAmount,
        createdAt,
        validFrom,
        validTo,
      },
    }: CreateWithdrawalMessage,
  ) {
    try {
      await createWithdrawalCommand(
        this.accountsEventStore,
        this.withdrawalsEventStore,
      ).handler(
        {
          receiptId,
          accountId,
          chainId,
          tokenSymbol,
          tokenAddress,
          tokenDecimals,
          tokenAmount,
          signature,
          creditAmount,
          createdAt,
          validFrom,
          validTo,
        },
        [this.accountsEventStore, this.withdrawalsEventStore],
        {},
      );
    } catch (e) {
      this.logger.error('Error crediting account', e);
      return { success: false, error: e.message };
    }

    return { success: true };
  }

  @MessagePattern({
    cmd: MarkWithdrawalAsCompleteMessage.messageType,
  })
  async handleMarkWithdrawalAsComplete(
    @Payload()
    { receiptId, transactionHash }: MarkWithdrawalAsCompleteMessage,
  ) {
    try {
      await markWithdrawalAsCompleteCommand(this.withdrawalsEventStore).handler(
        {
          receiptId,
          transactionHash,
          confirmed: false,
        },
        [this.withdrawalsEventStore],
        {},
      );
    } catch (e) {
      this.logger.error('Error marking withdrawal as complete', e);
      return { success: false, error: e.message };
    }

    return { success: true };
  }
}
