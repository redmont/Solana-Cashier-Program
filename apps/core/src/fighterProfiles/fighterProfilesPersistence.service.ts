import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { FighterProfile } from './fighterProfile.interface';
import { Key } from '@/interfaces/key';
import { FighterProfilesQueryStoreService } from 'query-store';

@Injectable()
export class FighterProfilesPersistenceService {
  constructor(
    @InjectModel('fighterProfile')
    private readonly fighterProfileModel: Model<FighterProfile, Key>,
    private readonly fighterProfilesQueryStore: FighterProfilesQueryStoreService,
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

    await this.fighterProfilesQueryStore.updateFighterProfile(item);
  }

  async update(
    codeName: string,
    item: Omit<
      FighterProfile,
      | 'pk'
      | 'sk'
      | 'codeName'
      | 'fightCount'
      | 'winningFightCount'
      | 'wageredSum'
    >,
  ) {
    const updatedItem = await this.fighterProfileModel.update(
      { pk: 'fighterProfile', sk: codeName },
      item,
      {
        return: 'item',
        returnValues: 'ALL_NEW',
      },
    );

    await this.fighterProfilesQueryStore.updateFighterProfile(updatedItem);
  }

  async add(codeName: string, values: Record<string, number>) {
    const item = await this.fighterProfileModel.update(
      { pk: 'fighterProfile', sk: codeName },
      {
        $ADD: values,
      },
      {
        return: 'item',
        returnValues: 'ALL_NEW',
      },
    );

    await this.fighterProfilesQueryStore.updateFighterProfile(item);
  }
}
