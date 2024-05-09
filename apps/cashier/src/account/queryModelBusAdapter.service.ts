import {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
  StateCarryingMessage,
} from '@castore/core';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BalanceUpdatedEvent } from 'cashier-messages';
import { ReadModelService } from 'cashier-read-model';
import { AccountAggregate } from 'src/account/aggregates';
import { AccountEventDetails } from 'src/account/reducers/accountsReducer';

@Injectable()
export class QueryModelBusAdapter implements MessageChannelAdapter {
  constructor(
    private readonly readModelService: ReadModelService,
    @Inject('BROKER') private readonly broker: ClientProxy,
  ) {}

  async publishMessage(
    message: StateCarryingMessage<
      string,
      AccountEventDetails,
      AccountAggregate
    >,
    options?: PublishMessageOptions,
  ) {
    const { accountId, primaryWalletAddress, balance } = message.aggregate;

    if (message.event.type === 'ACCOUNT_CREATED') {
      await this.readModelService.createAccount(
        accountId,
        primaryWalletAddress,
      );
    } else {
      await this.readModelService.updateAccountBalance(accountId, balance);
    }

    this.broker.emit(BalanceUpdatedEvent.messageType, {
      userId: accountId,
      balance: balance.toString(),
    });
  }
  publishMessages: (
    messages: Message[],
    options?: PublishMessageOptions,
  ) => Promise<void>;
}
