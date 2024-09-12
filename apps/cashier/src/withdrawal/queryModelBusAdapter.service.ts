import {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
  StateCarryingMessage,
} from '@castore/core';
import { Injectable } from '@nestjs/common';
import { ReadModelService } from 'cashier-read-model';
import { WithdrawalAggregate } from './aggregate';
import { WithdrawalEventDetails } from './reducer';

@Injectable()
export class WithdrawalQueryModelBusAdapter implements MessageChannelAdapter {
  constructor(private readonly readModelService: ReadModelService) {}

  async publishMessage(
    message: StateCarryingMessage<
      string,
      WithdrawalEventDetails,
      WithdrawalAggregate
    >,
    options?: PublishMessageOptions,
  ) {
    if (message.event.type === 'WITHDRAWAL_CREATED') {
      const {
        accountId,
        receiptId,
        creditAmount,
        chainId,
        signature,
        tokenSymbol,
        tokenAmount,
        tokenDecimals,
        validFrom,
        validTo,
      } = message.aggregate;

      await this.readModelService.createWithdrawal({
        accountId,
        receiptId,
        createdAt: message.event.timestamp,
        creditAmount,
        chainId,
        signature,
        tokenSymbol,
        tokenAmount,
        tokenDecimals,
        validFrom,
        validTo,
      });
    }

    if (
      message.event.type === 'WITHDRAWAL_COMPLETED_UNCONFIRMED' ||
      message.event.type === 'WITHDRAWAL_COMPLETED_CONFIRMED'
    ) {
      const { accountId, receiptId, transactionHash } = message.aggregate;
      console.log('Updating withdrawal', transactionHash);
      await this.readModelService.updateWithdrawal(accountId, receiptId, {
        status: 'Completed',
        transactionHash,
      });
    }
  }
  publishMessages: (
    messages: Message[],
    options?: PublishMessageOptions,
  ) => Promise<void>;
}
