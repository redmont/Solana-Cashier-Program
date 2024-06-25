import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { FighterProfile } from './fighterProfile.interface';
import { Key } from '@/interfaces/key';

@Injectable()
export class FighterProfilesPersistenceService {
  constructor(
    @InjectModel('fighterProfile')
    private readonly fighterProfileModel: Model<FighterProfile, Key>,
  ) {}

  async list() {
    return this.fighterProfileModel.query({ pk: 'fighterProfile' }).exec();
  }

  async get(codeName: string) {
    return this.fighterProfileModel.get({ pk: 'fighterProfile', sk: codeName });
  }

  async create(item: FighterProfile) {
    await this.fighterProfileModel.create(
      {
        pk: 'fighterProfile',
        sk: item.codeName,
        ...item,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async update(codeName: string, item: Omit<FighterProfile, 'codeName'>) {
    await this.fighterProfileModel.update(
      { pk: 'fighterProfile', sk: codeName },
      item,
    );
  }
}
