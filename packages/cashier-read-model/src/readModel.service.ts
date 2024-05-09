import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account } from './interfaces/account.interface';
import { ReadModelKey } from './interfaces/key.interface';
import { AccountCount } from './interfaces/accountCount.interface';

@Injectable()
export class ReadModelService {
  constructor(
    @InjectModel('account')
    private readonly accountModel: Model<Account, ReadModelKey>,
    @InjectModel('accountCount')
    private readonly accountCountModel: Model<AccountCount, ReadModelKey>,
  ) {}

  async createAccount(accountId: string, primaryWalletAddress: string) {
    await this.accountModel.create({
      pk: `account`,
      sk: `account#${accountId}`,
      primaryWalletAddress,
      balance: 0,
    });

    console.log('Updating account count');
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

  async updateAccountBalance(accountId: string, balance: number) {
    await this.accountModel.update(
      {
        pk: `account`,
        sk: `account#${accountId}`,
      },
      {
        $SET: {
          balance,
        },
      },
    );
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
      .exec();
  }

  async getLeaderboard(pageSize: number = 50, pageNumber: number = 1) {
    const accountCount = await this.accountCountModel.get({
      pk: 'accountCount',
      sk: 'accountCount',
    });

    const totalCount = accountCount ? accountCount.count : 0;

    let currentPage = 1;
    let lastKey;
    while (currentPage <= pageNumber) {
      const query = this.accountModel
        .query({
          pk: 'account',
        })
        .using('pkBalance')
        .limit(pageSize);
      if (lastKey) {
        query.startAt(lastKey);
      }

      const response = await query.exec();
      lastKey = response.lastKey;
      currentPage += 1;

      if (currentPage > pageNumber) {
        return {
          totalCount,
          items: response
            .filter((item) => item.balance > 0)
            .map((item) => ({
              walletAddress: item.primaryWalletAddress,
              balance: item.balance,
            })),
        };
      }
    }

    return {
      totalCount,
      items: [],
    };
  }
}
