import {
  Message,
  MessageChannelAdapter,
  PublishMessageOptions,
  StateCarryingMessage,
} from '@castore/core';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { Injectable } from '@nestjs/common';
import {
  AccountCreditedEvent,
  AccountDebitedEvent,
  BalanceUpdatedEvent,
} from 'cashier-messages';
import { ReadModelService } from 'cashier-read-model';
import { AccountAggregate } from './aggregates';
import { AccountEventDetails } from './reducers/accountsReducer';

@Injectable()
export class QueryModelBusAdapter implements MessageChannelAdapter {
  constructor(
    private readonly readModelService: ReadModelService,
    private readonly broker: NatsJetStreamClientProxy,
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
        message.event.timestamp,
      );
    } else {
      await this.readModelService.updateAccountBalance(
        accountId,
        balance,
        message.event.timestamp,
      );

      const payload = message.event.payload as any;

      if (message.event.type === 'ACCOUNT_DEBITED') {
        this.broker.emit<any, AccountDebitedEvent>(
          AccountDebitedEvent.messageType,
          {
            timestamp: message.event.timestamp,
            userId: accountId,
            amount: payload.amount,
            balance: balance.toString(),
            reason: payload.reason,
          },
        );
      }

      if (message.event.type === 'ACCOUNT_CREDITED') {
        this.broker.emit<any, AccountCreditedEvent>(
          AccountCreditedEvent.messageType,
          {
            timestamp: message.event.timestamp,
            userId: accountId,
            primaryWalletAddress: primaryWalletAddress,
            amount: payload.amount,
            balance: balance.toString(),
            reason: payload.reason,
          },
        );
      }
    }

    this.broker.emit(BalanceUpdatedEvent.messageType, {
      timestamp: message.event.timestamp,
      userId: accountId,
      balance: balance.toString(),
    });
  }
  publishMessages: (
    messages: Message[],
    options?: PublishMessageOptions,
  ) => Promise<void>;
}
