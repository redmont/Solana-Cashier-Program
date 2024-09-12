import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account } from './interfaces/account.interface';
import { ReadModelKey } from './interfaces/key.interface';
import { AccountCount } from './interfaces/accountCount.interface';
import { RedisCacheService } from 'global-cache';
import { Withdrawal } from './interfaces/withdrawal.interface';
import { SortOrder } from 'dynamoose/dist/General';

@Injectable()
export class ReadModelService {
  constructor(
    private readonly cache: RedisCacheService,
    @InjectModel('account')
    private readonly accountModel: Model<Account, ReadModelKey>,
    @InjectModel('accountCount')
    private readonly accountCountModel: Model<AccountCount, ReadModelKey>,
    @InjectModel('withdrawal')
    private readonly withdrawalModel: Model<Withdrawal, ReadModelKey>,
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

  async createWithdrawal({
    accountId,
    receiptId,
    createdAt,
    creditAmount,
    chainId,
    signature,
    tokenSymbol,
    tokenAmount,
    tokenDecimals,
    validFrom,
    validTo,
  }: {
    accountId: string;
    receiptId: string;
    createdAt: string;
    creditAmount: number;
    chainId: string;
    signature: string;
    tokenSymbol?: string;
    tokenAmount: string;
    tokenDecimals: number;
    validFrom: string;
    validTo: string;
  }) {
    await this.withdrawalModel.create({
      pk: `withdrawal#${accountId}`,
      sk: receiptId,
      accountId,
      createdAt,
      updatedAt: createdAt,
      creditAmount,
      chainId,
      signature,
      tokenSymbol,
      tokenAmount,
      tokenDecimals,
      validFrom,
      validTo,
      status: 'Pending',
      itemType: 'withdrawal',
    });
  }

  async updateWithdrawal(
    accountId: string,
    receiptId: string,
    values: Pick<Withdrawal, 'status' | 'transactionHash'>,
  ) {
    const set = {};
    for (const [key, value] of Object.entries(values)) {
      set[key] = value;
    }

    await this.withdrawalModel.update(
      {
        pk: `withdrawal#${accountId}`,
        sk: receiptId,
      },
      {
        $SET: set,
      },
    );
  }

  async getWithdrawals(
    accountId: string,
  ): Promise<(Omit<Withdrawal, 'pk' | 'sk'> & { receiptId: string })[]> {
    const result = await this.withdrawalModel
      .query({ pk: `withdrawal#${accountId}` })
      .using('pkCreatedAt')
      .sort(SortOrder.descending)
      .exec();

    return result.map(({ pk, sk, ...rest }) => ({ ...rest, receiptId: sk }));
  }
}
