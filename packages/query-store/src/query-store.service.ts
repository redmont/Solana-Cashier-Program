import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from './interfaces/key.interface';
import { MatchModel } from './interfaces/match.interface';
import { SeriesModel } from './interfaces/series.interface';

@Injectable()
export class QueryStoreService {
  constructor(
    @InjectModel('series')
    private readonly seriesModel: Model<SeriesModel, Key>,
    @InjectModel('match')
    private readonly matchModel: Model<MatchModel, Key>,
  ) {}

  async getSeries(seriesCodeName: string) {
    const series = await this.seriesModel.get({
      pk: `series:${seriesCodeName}`,
      sk: 'series',
    });

    return series;
  }

  async saveSeries(codeName: string, state: string) {
    await this.seriesModel.create(
      {
        pk: `series:${codeName}`,
        sk: 'series',
        state,
        bets: [],
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async updateSeries(codeName: string, state: string, startTime?: string) {
    await this.seriesModel.update(
      {
        pk: `series:${codeName}`,
        sk: 'series',
      },
      {
        state,
        startTime: startTime ?? undefined,
      },
    );
  }

  async saveMatch(
    seriesCodeName: string,
    match: { state: string; bets: any[] },
  ) {
    console.log('persisting match read model', match);

    await this.matchModel.create(
      {
        pk: `match:${seriesCodeName}`,
        sk: 'match',
        ...match,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async createBet(
    seriesCodeName: string,
    walletAddress: string,
    amount: string,
    fighter: string,
  ) {
    await this.seriesModel.update(
      {
        pk: `series:${seriesCodeName}`,
        sk: 'series',
      },
      {
        $ADD: {
          bets: [
            {
              walletAddress,
              amount,
              fighter,
            },
          ],
        },
      },
    );
  }

  async setBets(seriesCodeName: string, bets: any[]) {
    await this.matchModel.update(
      {
        pk: `series:${seriesCodeName}`,
        sk: 'series',
      },
      {
        bets,
      },
    );
  }
}
