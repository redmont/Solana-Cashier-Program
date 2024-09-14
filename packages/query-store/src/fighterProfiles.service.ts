import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisCacheService } from 'global-cache';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from 'src/interfaces/key.interface';
import { FighterProfile as FighterProfileModel } from './interfaces/fighterProfile.interface';

export type FighterProfile = Omit<FighterProfileModel, 'pk' | 'sk'>;

@Injectable()
export class FighterProfilesQueryStoreService implements OnModuleInit {
  constructor(
    private readonly cache: RedisCacheService,
    @InjectModel('fighterProfile')
    private readonly fighterProfileModel: Model<FighterProfileModel, Key>,
  ) {}

  onModuleInit() {
    this.refreshCache();
  }

  async updateFighterProfile(
    fighterProfile: Omit<FighterProfileModel, 'pk' | 'sk'>,
  ) {
    await this.fighterProfileModel.create(
      {
        pk: 'fighterProfile',
        sk: fighterProfile.codeName,
        ...fighterProfile,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );

    await this.cache.setListItem(
      'fighterProfile',
      fighterProfile.codeName,
      fighterProfile,
    );
  }

  async refreshCache() {
    const fighterProfiles = await this.fighterProfileModel
      .query({ pk: 'fighterProfile' })
      .exec();

    for (const fighterProfile of fighterProfiles) {
      await this.cache.setListItem(
        'fighterProfile',
        fighterProfile.codeName,
        fighterProfile,
      );
    }
  }

  getFighterProfiles(): Promise<FighterProfile[]> {
    return this.cache.getListItems('fighterProfile');
  }
}
