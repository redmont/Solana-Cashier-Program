import {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
  StateCarryingMessage,
} from '@castore/core';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { AccountAggregate } from 'src/account/aggregates';
import { ReadModelService } from 'src/account/read-model/read-model.service';
import { AccountEventDetails } from 'src/account/reducers/accounts-reducer';
import { BalanceUpdatedEvent } from 'cashier-messages';

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

    await this.readModelService.upsertAccount(
      accountId,
      primaryWalletAddress,
      balance,
    );

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
