import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { QueryStoreService } from 'query-store';
import { Series } from './series.interface';
import { Key } from '@/interfaces/key';

@Injectable()
export class SeriesPersistenceService {
  constructor(
    @InjectModel('series') private readonly seriesModel: Model<Series, Key>,
    private readonly queryStore: QueryStoreService,
  ) {}

  async get() {
    return this.seriesModel.query({ pk: 'series' }).exec();
  }

  async getOne(codeName: string) {
    return this.seriesModel.get({ pk: 'series', sk: codeName });
  }

  async create(
    codeName: string,
    displayName: string,
    betPlacementTime: number,
    preMatchVideoPath: string,
    preMatchDelay: number,
    fighterProfiles: string[],
    level: string,
    fightType: string,
  ) {
    const data = {
      pk: 'series',
      sk: codeName,
      displayName,
      betPlacementTime,
      preMatchVideoPath,
      preMatchDelay,
      fighterProfiles,
      level,
      fightType,
    };

    await this.seriesModel.create(data, {
      overwrite: true,
      return: 'item',
    });

    await this.queryStore.saveSeries(codeName, '', '');
  }

  async update(
    codeName: string,
    displayName: string,
    betPlacementTime: number,
    preMatchVideoPath: string,
    preMatchDelay: number,
    fighterProfiles: string[],
    level: string,
  ) {
    const series = await this.getOne(codeName);
    if (!series) {
      throw new Error('Series not found');
    }

    await this.seriesModel.update(
      {
        pk: 'series',
        sk: codeName,
      },
      {
        displayName,
        betPlacementTime,
        preMatchVideoPath,
        preMatchDelay,
        fighterProfiles,
        level,
      },
    );
  }

  async saveState(codeName: string, state: any) {
    await this.seriesModel.update(
      {
        pk: 'series',
        sk: codeName,
      },
      {
        state,
      },
    );
  }

  async savePublicState(
    codeName: string,
    matchId: string,
    fighters: {
      codeName: string;
      displayName: string;
      ticker: string;
      imagePath: string;
    }[],
    state: any,
    preMatchVideoPath: string,
    startTime?: string,
    winner?: string,
  ) {
    await this.queryStore.updateCurrentMatch(
      codeName,
      matchId,
      fighters,
      state,
      preMatchVideoPath,
      startTime,
      winner,
    );
  }
}
