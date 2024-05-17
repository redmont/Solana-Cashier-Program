import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from './interfaces/key.interface';
import { Match } from './interfaces/match.interface';
import { Series } from './interfaces/series.interface';
import { ActivityStream } from './interfaces/activityStream.interface';
import { CurrentMatch } from './interfaces/currentMatch.interface';
import { UserMatchResult } from './interfaces/userMatchResult.interface';
import { Roster } from './interfaces/roster.interface';
import { UserMatch } from './interfaces/userMatch.interface';
import { GetMatchResult } from './models/getMatchResult';
import { GetUserMatchResult } from './models/getUserMatchResult';

@Injectable()
export class QueryStoreService implements OnModuleInit {
  constructor(
    @InjectModel('series')
    private readonly seriesModel: Model<Series, Key>,
    @InjectModel('match')
    private readonly matchModel: Model<Match, Key>,
    @InjectModel('activityStream')
    private readonly activityStreamModel: Model<ActivityStream, Key>,
    @InjectModel('currentMatch')
    private readonly currentMatchModel: Model<CurrentMatch, Key>,
    @InjectModel('userMatch')
    private readonly userMatchModel: Model<UserMatch, Key>,
    @InjectModel('userMatchResult')
    private readonly userMatchResultModel: Model<UserMatchResult, Key>,
    @InjectModel('roster')
    private readonly rosterModel: Model<Roster, Key>,
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
        preMatchVideoPath: '',
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

  async getCurrentMatch(): Promise<CurrentMatch> {
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
      imagePath: string;
    }[],
    state: string,
    preMatchVideoPath: string,
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
        preMatchVideoPath,
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
    await this.seriesModel.update(
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

  async createMatch({
    seriesCodeName,
    matchId,
    startTime,
    fighters,
    winner,
  }: {
    seriesCodeName: string;
    matchId: string;
    startTime: string;
    fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      imagePath: string;
      betCount: number;
    }[];
    winner: {
      codeName: string;
    };
  }) {
    await this.matchModel.create({
      pk: 'match',
      sk: `${startTime}#${seriesCodeName}`,
      seriesCodeName,
      matchId,
      startTime,
      fighters,
      winner,
    });
  }

  async createUserMatch({
    userId,
    betAmount,
    winAmount,
    seriesCodeName,
    matchId,
    startTime,
    fighters,
    winner,
  }: {
    userId: string;
    betAmount: string;
    winAmount: string;
    seriesCodeName: string;
    matchId: string;
    startTime: string;
    fighters: {
      displayName: string;
      codeName: string;
      ticker: string;
      imagePath: string;
      betCount: number;
    }[];
    winner: {
      codeName: string;
    };
  }) {
    await this.userMatchModel.create({
      pk: `match#${userId}`,
      sk: `${startTime}#${seriesCodeName}`,
      userId,
      betAmount,
      winAmount,
      seriesCodeName,
      matchId,
      startTime,
      fighters,
      winner,
    });
  }

  async createUserMatchResult(matchId: string, userId: string, amount: number) {
    await this.userMatchResultModel.create({
      pk: `userMatchResult#${matchId}`,
      sk: userId,
      amount,
    });
  }

  async updateRoster(roster: { codeName: string }[]) {
    await this.rosterModel.create(
      {
        pk: 'roster',
        sk: 'roster',
        roster,
      },
      {
        return: 'item',
        overwrite: true,
      },
    );
  }

  async getRoster() {
    const roster = await this.rosterModel.get({
      pk: 'roster',
      sk: 'roster',
    });

    return roster;
  }

  async getMatches(): Promise<GetMatchResult[]> {
    const matches = await this.matchModel.query({ pk: 'match' }).exec();

    return matches.map(({ pk, sk, ...rest }) => rest);
  }

  async getUserMatches(userId: string): Promise<GetUserMatchResult[]> {
    const matches = await this.userMatchModel
      .query({ pk: `match#${userId}` })
      .exec();

    return matches.map(({ pk, sk, userId, ...rest }) => rest);
  }
}
