import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account } from './interfaces/account.interface';
import { ReadModelKey } from './interfaces/key.interface';
import { AccountCount } from './interfaces/accountCount.interface';
import { RedisCacheService } from 'global-cache';

@Injectable()
export class ReadModelService {
  constructor(
    private readonly cache: RedisCacheService,
    @InjectModel('account')
    private readonly accountModel: Model<Account, ReadModelKey>,
    @InjectModel('accountCount')
    private readonly accountCountModel: Model<AccountCount, ReadModelKey>,
  ) {}

  async createAccount(
    accountId: string,
    primaryWalletAddress: string,
    timestamp: string,
  ) {
    await this.accountModel.create({
      pk: `account`,
      sk: `account#${accountId}`,
      primaryWalletAddress,
      balance: 0,
      lastUpdated: timestamp,
    });

    await this.accountCountModel.update(
      {
        pk: `accountCount`,
        sk: `accountCount`,
      },
      {
        $ADD: {
          count: 1,
        },
      },
    );
  }

  async updateAccountBalance(
    accountId: string,
    balance: number,
    timestamp: string,
  ) {
    await this.accountModel.update(
      {
        pk: `account`,
        sk: `account#${accountId}`,
      },
      {
        $SET: {
          balance,
          lastUpdated: timestamp,
        },
      },
    );

    await this.cache.set(
      `cashier.acccountBalance:${accountId}`,
      balance.toString(),
    );
  }

  async getAccountBalance(accountId: string) {
    const cachedBalance = await this.cache.get(
      `cashier.acccountBalance:${accountId}`,
    );

    if (cachedBalance) {
      return Number(cachedBalance);
    }

    const account = await this.accountModel.get({
      pk: `account`,
      sk: `account#${accountId}`,
    });

    return account?.balance ?? 0;
  }

  async getAccount(accountId: string) {
    return this.accountModel.get({ pk: `account`, sk: `account#${accountId}` });
  }

  async getAllAccounts() {
    return this.accountModel.query({ pk: 'account' }).exec();
  }

  async getAccountByWalletAddress(walletAddress: string) {
    return this.accountModel
      .query({ primaryWalletAddress: walletAddress })
      .using('primaryWalletAddress')
      .exec();
  }
}
