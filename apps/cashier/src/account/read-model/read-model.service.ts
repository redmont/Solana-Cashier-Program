import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account, ReadModelKey } from './read-model.interface';

@Injectable()
export class ReadModelService {
  constructor(
    @InjectModel('accountModel')
    private readonly accountModel: Model<Account, ReadModelKey>,
  ) {}

  async upsertAccount(accountId: string, balance: number) {
    await this.accountModel.create(
      {
        pk: `account#${accountId}`,
        sk: `account`,
        balance,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async getAccount(accountId: string) {
    return this.accountModel.get({ pk: `account#${accountId}`, sk: `account` });
  }
}
