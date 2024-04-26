import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

import { Controller, Logger } from '@nestjs/common';
import { createAccountCommand } from './commands/create-account.command';
import { ConnectedEventStore } from '@castore/core';
import { creditAccountCommand } from './commands/credit-account.command';
import { ReadModelService } from 'src/account/read-model/read-model.service';
import { debitAccountCommand } from './commands/debit-account.command';
import {
  CreditMessage,
  CreditByWalletAddressMessage,
  DebitMessage,
  DebitByWalletAddressMessage,
  GetAllBalancesMessage,
  GetBalanceMessage,
  GetAllBalancesMessageResponse,
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

  @MessagePattern(DebitByWalletAddressMessage.messageType)
  async handleDebitByWalletAddress(
    @Payload() data: DebitByWalletAddressMessage,
  ) {
    const accounts = await this.readModelService.getAccountByWalletAddress(
      data.walletAddress,
    );
    if (accounts.length === 0) {
      return { success: false, error: 'Account not found' };
    }

    const accountId = accounts[0].sk.split('#')[1];

    try {
      await debitAccountCommand(this.eventStore).handler(
        {
          accountId,
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

  @MessagePattern(CreditByWalletAddressMessage.messageType)
  async handleCreditByWalletAddress(
    @Payload() data: CreditByWalletAddressMessage,
  ) {
    const accounts = await this.readModelService.getAccountByWalletAddress(
      data.walletAddress,
    );
    if (accounts.length === 0) {
      return { success: false, error: 'Account not found' };
    }

    const accountId = accounts[0].sk.split('#')[1];

    try {
      await creditAccountCommand(this.eventStore).handler(
        {
          accountId,
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

  @MessagePattern(GetAllBalancesMessage.messageType)
  async handleGetAllBalances(): Promise<GetAllBalancesMessageResponse> {
    const accounts = await this.readModelService.getAllAccounts();

    return {
      success: true,
      accounts: accounts.map(({ sk, primaryWalletAddress, balance }) => {
        return {
          accountId: sk.split('#')[1],
          primaryWalletAddress,
          balance,
        };
      }),
    };
  }

  @EventPattern('user.created')
  async userCreated(@Payload() data: any) {
    await createAccountCommand(this.eventStore).handler(
      {
        accountId: data.userId,
        primaryWalletAddress: data.primaryWalletAddress,
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
