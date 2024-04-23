import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { Controller, Logger } from '@nestjs/common';
import { createAccountCommand } from './commands/create-account.command';
import { ConnectedEventStore } from '@castore/core';
import { creditAccountCommand } from './commands/credit-account.command';
import { ReadModelService } from 'src/account/read-model/read-model.service';
import { debitAccountCommand } from './commands/debit-account.command';
import {
  CreditMessage,
  DebitMessage,
  GetBalanceMessage,
} from 'cashier-messages';

@Controller()
export class AccountController {
  private logger = new Logger(AccountController.name);

  constructor(
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService,
  ) {}

  @MessagePattern(GetBalanceMessage.messageType)
  async handleGetBalance(@Payload() data: GetBalanceMessage) {
    const account = await this.readModelService.getAccount(data.accountId);

    return {
      success: true,
      balance: account.balance,
    };
  }

  @MessagePattern(DebitMessage.messageType)
  async handleDebit(@Payload() data: DebitMessage) {
    try {
      await debitAccountCommand(this.eventStore).handler(
        {
          accountId: data.accountId,
          amount: data.amount,
        },
        [this.eventStore],
        {},
      );
    } catch (e) {
      this.logger.error('Error debiting account', e);
      return { success: false, error: e.message };
    }

    return { success: true };
  }

  @MessagePattern(CreditMessage.messageType)
  async handleCredit(@Payload() data: CreditMessage) {
    try {
      await creditAccountCommand(this.eventStore).handler(
        {
          accountId: data.accountId,
          amount: data.amount,
        },
        [this.eventStore],
        {},
      );
    } catch (e) {
      this.logger.error('Error crediting account', e);
      return { success: false, error: e.message };
    }

    return { success: true };
  }

  @EventPattern('user.created')
  async userCreated(@Payload() data: any) {
    await createAccountCommand(this.eventStore).handler(
      {
        accountId: data.userId,
      },
      [this.eventStore],
      {},
    );

    await creditAccountCommand(this.eventStore).handler(
      {
        accountId: data.userId,
        amount: 1000,
      },
      [this.eventStore],
      {},
    );
  }
}
