import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from './interfaces/key.interface';
import { MatchModel } from './interfaces/match.interface';
import { SeriesModel } from './interfaces/series.interface';
import { ActivityStreamModel } from './interfaces/activityStream.interface';

@Injectable()
export class QueryStoreService {
  constructor(
    @InjectModel('series')
    private readonly seriesModel: Model<SeriesModel, Key>,
    @InjectModel('match')
    private readonly matchModel: Model<MatchModel, Key>,
    @InjectModel('activityStream')
    private readonly activityStreamModel: Model<ActivityStreamModel, Key>,
  ) {}

  async getSeries(seriesCodeName: string) {
    const series = await this.seriesModel.get({
      pk: `series#${seriesCodeName}`,
      sk: 'series',
    });

    return series;
  }

  async saveSeries(codeName: string, matchId: string, state: string) {
    await this.seriesModel.create(
      {
        pk: `series#${codeName}`,
        sk: 'series',
        matchId,
        state,
        bets: [],
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async updateSeries(
    codeName: string,
    matchId: string,
    state: string,
    startTime?: string,
    winner?: string,
  ) {
    await this.seriesModel.update(
      {
        pk: `series#${codeName}`,
        sk: 'series',
      },
      {
        matchId,
        state,
        startTime: startTime ?? undefined,
        winner: winner ?? undefined,
      },
    );
  }

  async saveMatch(
    seriesCodeName: string,
    match: { state: string; bets: any[] },
  ) {
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
        pk: `series#${seriesCodeName}`,
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
        pk: `series#${seriesCodeName}`,
        sk: 'series',
      },
      {
        bets,
      },
    );
  }

  async createActivityStreamItem(
    seriesCodeName: string,
    timestamp: string,
    matchId: string,
    message: string,
    userId?: string,
  ) {
    let pk = `activityStream#${seriesCodeName}#${matchId}`;
    if (userId) {
      pk += `#${userId}`;
    }

    await this.activityStreamModel.create({
      pk,
      sk: timestamp,
      message,
    });
  }

  async getActivityStream(
    seriesCodeName: string,
    matchId: string,
    userId?: string,
  ) {
    let pk = `activityStream#${seriesCodeName}#${matchId}`;
    if (userId) {
      pk += `#${userId}`;
    }

    const items = await this.activityStreamModel
      .query({
        pk,
      })
      .exec();

    return items;
  }
}
