import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account } from './interfaces/account.interface';
import { ReadModelKey } from './interfaces/key.interface';
import { AccountCount } from './interfaces/accountCount.interface';
import { SortOrder } from 'dynamoose/dist/General';

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

  async getLeaderboard(
    pageSize: number = 50,
    pageNumber: number = 1,
    userId: string = null,
    searchQuery: string = null,
  ): Promise<{
    items: {
      rank: number;
      walletAddress: string;
      balance: number;
    }[];
    totalCount?: number;
    currentUserItem?: {
      rank: number;
      walletAddress: string;
      balance: number;
    };
  }> {
    let currentPage = 1;
    let rank = 1;
    let lastKey;
    let currentUserItem;

    do {
      const query = this.accountModel
        .query({
          pk: 'account',
        })
        .using('pkBalance')
        .limit(pageSize)
        .sort(SortOrder.descending);
      if (lastKey) {
        query.startAt(lastKey);
      }

      const response = await query.exec();
      lastKey = response.lastKey;
      currentPage += 1;

      if (searchQuery) {
        const matches = [];
        for (const item of response) {
          if (
            item.primaryWalletAddress
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          ) {
            matches.push({ ...item, rank });
          }

          rank++;
        }

        return {
          items: matches.map(({ rank, primaryWalletAddress, balance }) => ({
            rank,
            walletAddress: primaryWalletAddress,
            balance,
          })),
        };
      } else {
        if (userId) {
          const userItemIndex = response.findIndex(
            (x) => x.sk === `account#${userId}`,
          );
          if (userItemIndex !== -1) {
            const userItem = response[userItemIndex];
            const userRank = rank + userItemIndex;
            currentUserItem = {
              rank: userRank,
              walletAddress: userItem.primaryWalletAddress,
              balance: userItem.balance,
            };
          }
        }

        if (currentPage > pageNumber) {
          const accountCount = await this.accountCountModel.get({
            pk: 'accountCount',
            sk: 'accountCount',
          });

          const totalCount = accountCount ? accountCount.count : 0;

          return {
            totalCount,
            currentUserItem,
            items: response
              .map((item) => ({
                rank: rank++,
                walletAddress: item.primaryWalletAddress,
                balance: item.balance,
              }))
              // Filter after mapping to ensure rank is correct
              .filter((item) => item.balance > 0),
          };
        } else {
          rank += response.length;
        }
      }
    } while (lastKey);

    return {
      totalCount: 0,
      items: [],
    };
  }
}
