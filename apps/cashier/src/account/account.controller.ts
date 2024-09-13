import axios from 'axios';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Inject, Logger } from '@nestjs/common';
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
  EnsureAccountExistsMessage,
  ResetBalanceMessage,
} from 'cashier-messages';
import { ReadModelService } from 'cashier-read-model';
import {
  createAccountCommand,
  creditAccountCommand,
  debitAccountCommand,
  ensureAccountExistsCommand,
  InsufficientBalanceError,
  resetAccountBalanceCommand,
} from '@/commands';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AccountController {
  private logger = new Logger(AccountController.name);

  constructor(
    @Inject('AccountsConnectedEventStore')
    private readonly eventStore: ConnectedEventStore,
    private readonly readModelService: ReadModelService,
    private readonly configService: ConfigService,
  ) {}

  @MessagePattern({ cmd: EnsureAccountExistsMessage.messageType })
  async handleEnsureAccountExists(@Payload() data: EnsureAccountExistsMessage) {
    await ensureAccountExistsCommand(this.eventStore).handler(
      {
        accountId: data.accountId,
        primaryWalletAddress: data.primaryWalletAddress,
        initialDeposit: 100,
      },
      [this.eventStore],
      {},
    );

    return { success: true };
  }

  @MessagePattern({ cmd: CreateAccountMessage.messageType })
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
        reason: 'INITIAL_DEPOSIT',
      },
      [this.eventStore],
      {},
    );

    return { success: true };
  }

  @MessagePattern({ cmd: GetBalanceMessage.messageType })
  async handleGetBalance(@Payload() data: GetBalanceMessage) {
    const account = await this.readModelService.getAccount(data.accountId);

    return {
      success: true,
      balance: account?.balance ?? 0,
    };
  }

  @MessagePattern({ cmd: DebitMessage.messageType })
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
    try {
      const apiKey = this.configService.get<string>('fpApiKey');
      const acc = await this.readModelService.getAccount(accountId);
      const event_id = acc.lastUpdated + acc.balance;
      const usdAmount = (amount * 0.000099 * 100).toString(); // in cents
      const res = await axios.post(
        'https://firstpromoter.com/api/v1/track/signup',
        new URLSearchParams({
          uid: accountId,
          event_id,
          amount: usdAmount,
          currency: 'USD',
        }),
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (e) {
      this.logger.error('Error sending first promoter event', e);
    }

    return { success: true };
  }

  @MessagePattern({ cmd: CreditMessage.messageType })
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

  @MessagePattern({ cmd: DebitByWalletAddressMessage.messageType })
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

  @MessagePattern({ cmd: CreditByWalletAddressMessage.messageType })
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

  @MessagePattern({ cmd: GetAllBalancesMessage.messageType })
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

  @MessagePattern({ cmd: ResetBalanceMessage.messageType })
  async resetBalance(@Payload() { accountId, reason }: ResetBalanceMessage) {
    try {
      await resetAccountBalanceCommand(this.eventStore).handler(
        {
          accountId,
          reason: reason,
        },
        [this.eventStore],
        {},
      );
    } catch (e) {
      this.logger.error('Error resetting account balance', e);
      return { success: false, error: e.message };
    }

    return { success: true };
  }
}
