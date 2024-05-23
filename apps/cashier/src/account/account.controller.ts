import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Logger } from '@nestjs/common';
import { ConnectedEventStore } from '@castore/core';
import {
  CreateAccountMessage,
  CreditMessage,
  CreditByWalletAddressMessage,
  DebitMessage,
  DebitByWalletAddressMessage,
  GetAllBalancesMessage,
  GetBalanceMessage,
  GetAllBalancesMessageResponse,
} from 'cashier-messages';
import { ReadModelService } from 'cashier-read-model';
import { createAccountCommand } from './commands/createAccount.command';
import { creditAccountCommand } from './commands/creditAccount.command';
import {
  InsufficientBalanceError,
  debitAccountCommand,
} from './commands/debitAccount.command';

@Controller()
export class AccountController {
  private logger = new Logger(AccountController.name);

  constructor(
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService,
  ) {}

  @MessagePattern(CreateAccountMessage.messageType)
  async handleCreateAccount(@Payload() data: CreateAccountMessage) {
    await createAccountCommand(this.eventStore).handler(
      {
        accountId: data.accountId,
        primaryWalletAddress: data.primaryWalletAddress,
      },
      [this.eventStore],
      {},
    );

    await creditAccountCommand(this.eventStore).handler(
      {
        accountId: data.accountId,
        amount: 1000,
        reason: 'INITIAL_FREE_POINTS',
      },
      [this.eventStore],
      {},
    );

    return { success: true };
  }

  @MessagePattern(GetBalanceMessage.messageType)
  async handleGetBalance(@Payload() data: GetBalanceMessage) {
    const account = await this.readModelService.getAccount(data.accountId);

    return {
      success: true,
      balance: account?.balance ?? 0,
    };
  }

  @MessagePattern(DebitMessage.messageType)
  async handleDebit(@Payload() { accountId, amount, reason }: DebitMessage) {
    try {
      await debitAccountCommand(this.eventStore).handler(
        {
          accountId,
          amount,
          reason,
        },
        [this.eventStore],
        {},
      );
    } catch (e) {
      if (e instanceof InsufficientBalanceError) {
        return { success: false, error: 'Insufficient balance' };
      } else {
        this.logger.error('Error debiting account', e);
        return { success: false, error: e.message };
      }
    }

    return { success: true };
  }

  @MessagePattern(CreditMessage.messageType)
  async handleCredit(@Payload() { accountId, amount, reason }: CreditMessage) {
    try {
      await creditAccountCommand(this.eventStore).handler(
        {
          accountId,
          amount,
          reason,
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
    @Payload() { walletAddress, amount, reason }: DebitByWalletAddressMessage,
  ) {
    const accounts =
      await this.readModelService.getAccountByWalletAddress(walletAddress);
    if (accounts.length === 0) {
      return { success: false, error: 'Account not found' };
    }

    const accountId = accounts[0].sk.split('#')[1];

    try {
      await debitAccountCommand(this.eventStore).handler(
        {
          accountId,
          amount,
          reason,
        },
        [this.eventStore],
        {},
      );
    } catch (e) {
      if (e instanceof InsufficientBalanceError) {
        return { success: false, error: 'Insufficient balance' };
      } else {
        this.logger.error('Error debiting account', e);
        return { success: false, error: e.message };
      }
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
          reason: data.reason,
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
}
