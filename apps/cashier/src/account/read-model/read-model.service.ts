import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account, ReadModelKey } from './read-model.interface';

@Injectable()
export class ReadModelService {
  constructor(
    @InjectModel('accountModel')
    private readonly accountModel: Model<Account, ReadModelKey>,
  ) {}

  async upsertAccount(
    accountId: string,
    primaryWalletAddress: string,
    balance: number,
  ) {
    await this.accountModel.create(
      {
        pk: `account`,
        sk: `account#${accountId}`,
        primaryWalletAddress,
        balance,
      },
      {
        overwrite: true,
        return: 'item',
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
}
