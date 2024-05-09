import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from './interfaces/key.interface';
import { MatchModel } from './interfaces/match.interface';
import { SeriesModel } from './interfaces/series.interface';
import { ActivityStreamModel } from './interfaces/activityStream.interface';
import { CurrentMatchModel } from './interfaces/currentMatch.interface';
import { UserMatchResult } from './interfaces/userMatchResult.interface';

@Injectable()
export class QueryStoreService implements OnModuleInit {
  constructor(
    @InjectModel('series')
    private readonly seriesModel: Model<SeriesModel, Key>,
    @InjectModel('match')
    private readonly matchModel: Model<MatchModel, Key>,
    @InjectModel('activityStream')
    private readonly activityStreamModel: Model<ActivityStreamModel, Key>,
    @InjectModel('currentMatch')
    private readonly currentMatchModel: Model<CurrentMatchModel, Key>,
    @InjectModel('userMatchResult')
    private readonly userMatchResultModel: Model<UserMatchResult, Key>,
  ) {}

  async onModuleInit() {
    // Ensure there is a current match item
    const currentMatch = await this.currentMatchModel.get({
      pk: 'currentMatch',
      sk: 'currentMatch',
    });

    if (!currentMatch) {
      await this.currentMatchModel.create({
        pk: 'currentMatch',
        sk: 'currentMatch',
        fighters: [],
        state: 'idle',
        bets: [],
        matchId: '',
        seriesCodeName: '',
      });
    }
  }

  async getSeries(seriesCodeName: string) {
    const series = await this.seriesModel.get({
      pk: `series#${seriesCodeName}`,
      sk: 'series',
    });

    return series;
  }

  async getCurrentMatch() {
    const currentMatch = await this.currentMatchModel.get({
      pk: 'currentMatch',
      sk: 'currentMatch',
    });

    return {
      ...currentMatch,
      bets: currentMatch.bets ?? [],
    };
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
        state,
        matchId: matchId ?? undefined,
        startTime: startTime ?? undefined,
        winner: winner ?? undefined,
      },
    );
  }

  async updateCurrentMatch(
    seriesCodeName: string,
    matchId: string,
    fighters: {
      codeName: string;
      displayName: string;
      ticker: string;
      thumbnailUrl: string;
    }[],
    state: string,
    startTime?: string,
    winner?: string,
  ) {
    await this.currentMatchModel.update(
      {
        pk: `currentMatch`,
        sk: 'currentMatch',
      },
      {
        seriesCodeName,
        fighters,
        state,
        matchId: matchId ?? undefined,
        startTime: startTime ?? undefined,
        winner: winner ?? undefined,
      },
    );
  }

  async saveCurrentMatch(
    seriesCodeName: string,
    matchId: string,
    state: string,
    startTime?: string,
  ) {
    await this.currentMatchModel.update(
      {
        pk: `currentMatch`,
        sk: 'currentMatch',
      },
      {
        seriesCodeName,
        matchId,
        state,
        startTime,
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

  async resetCurrentMatch() {
    await this.currentMatchModel.update(
      {
        pk: `currentMatch`,
        sk: 'currentMatch',
      },
      {
        state: 'idle',
        winner: '',
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

  async createUserMatchResult(matchId: string, userId: string, amount: number) {
    await this.userMatchResultModel.create({
      pk: `userMatchResult#${matchId}`,
      sk: userId,
      amount,
    });
  }
}
