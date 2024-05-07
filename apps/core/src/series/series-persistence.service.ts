import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { QueryStoreService } from 'query-store';
import { Dayjs } from 'dayjs';
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
    fighters: {
      codeName: string;
      displayName: string;
      ticker: string;
      model: {
        head: string;
        torso: string;
        legs: string;
      };
    }[],
    level: string,
  ) {
    const data = {
      pk: 'series',
      sk: codeName,
      displayName,
      betPlacementTime,
      fighters,
      level,
    };

    await this.seriesModel.create(data, {
      overwrite: true,
      return: 'item',
    });

    await this.queryStore.saveSeries(codeName, '', '');
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
    state: any,
    startTime?: string,
    winner?: string,
  ) {
    await this.queryStore.updateSeries(
      codeName,
      matchId,
      state,
      startTime,
      winner,
    );
  }
}
