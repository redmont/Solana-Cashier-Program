import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Series } from './series.interface';
import { Key } from 'src/interfaces/key';
import { QueryStoreService } from 'query-store';
import { DateTime } from 'luxon';

@Injectable()
export class SeriesPersistenceService {
  constructor(
    @InjectModel('series') private readonly seriesModel: Model<Series, Key>,
    private readonly queryStore: QueryStoreService,
  ) {}

  async get() {
    return this.seriesModel.query({ pk: 'series' }).exec();
  }

  async create(codeName: string, displayName: string) {
    await this.seriesModel.create(
      {
        pk: 'series',
        sk: codeName,
        displayName,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );

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
    startTime?: DateTime,
    winner?: string,
  ) {
    await this.queryStore.updateSeries(
      codeName,
      matchId,
      state,
      startTime?.toISO(),
      winner,
    );
  }
}
