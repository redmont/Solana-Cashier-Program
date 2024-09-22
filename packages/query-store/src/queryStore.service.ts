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
import { SortOrder } from 'dynamoose/dist/General';
import { IndexUtils } from './indexUtils';
import { DailyClaimStatus } from './interfaces/dailyClaimStatus.interface';
import { DailyClaimAmounts } from './interfaces/dailyClaimAmounts.interface';
import { OrderBook } from './types';

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
    @InjectModel('dailyClaimAmounts')
    private readonly dailyClaimAmountsModel: Model<DailyClaimAmounts, Key>,
    @InjectModel('dailyClaimStatus')
    private readonly dailyClaimStatusModel: Model<DailyClaimStatus, Key>,
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
        streamId: '',
        lastUpdated: new Date().toISOString(),
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

  async updateCurrentMatch({
    seriesCodeName,
    matchId,
    fighters,
    state,
    preMatchVideoPath,
    streamId,
    poolOpenStartTime,
    startTime,
    winner,
    timestamp,
  }: {
    seriesCodeName: string;
    matchId: string;
    fighters: {
      codeName: string;
      displayName: string;
      ticker: string;
      tokenAddress?: string;
      tokenChainId?: string;
      imagePath: string;
    }[];
    state: string;
    preMatchVideoPath: string;
    streamId?: string;
    poolOpenStartTime?: string;
    startTime?: string;
    winner?: string;
    timestamp: string;
  }) {
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
        streamId: streamId ?? undefined,
        matchId: matchId ?? undefined,
        poolOpenStartTime: poolOpenStartTime ?? undefined,
        startTime: startTime ?? undefined,
        winner: winner ?? undefined,
        lastUpdated: timestamp,
      },
    );
  }

  async saveCurrentMatch({
    seriesCodeName,
    matchId,
    state,
    timestamp,
    startTime,
  }: {
    seriesCodeName: string;
    matchId: string;
    state: string;
    timestamp: string;
    startTime?: string;
  }) {
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
        lastUpdated: timestamp,
      },
    );
  }

  async createBet(
    seriesCodeName: string,
    walletAddress: string,
    amount: string,
    fighter: string,
    orderBook: OrderBook,
  ) {
    await this.currentMatchModel.update(
      {
        pk: `currentMatch`,
        sk: `currentMatch`,
      },
      {
        $ADD: {
          bets: [
            {
              walletAddress,
              amount,
              fighter,
              orderBook,
            },
          ],
        },
      },
    );
  }

  async resetCurrentMatch(timestamp: string) {
    await this.currentMatchModel.update(
      {
        pk: `currentMatch`,
        sk: 'currentMatch',
      },
      {
        state: 'idle',
        winner: '',
        bets: [],
        lastUpdated: timestamp,
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
    const matchFighters = IndexUtils.formatMatchFighters(
      fighters.map((fighter) => fighter.codeName),
    );

    await this.matchModel.create({
      pk: 'match',
      sk: `${startTime}#${seriesCodeName}`,
      seriesCodeName,
      matchId,
      startTime,
      fighters,
      matchFighters,
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

  async updateRoster(
    roster: {
      codeName: string;
      fighters: {
        displayName: string;
        imagePath: string;
      }[];
    }[],
  ) {
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

  async getMatchHistory(fighterCodeNames: string[]): Promise<GetMatchResult[]> {
    const matchFighters = IndexUtils.formatMatchFighters(fighterCodeNames);
    const matches = await this.matchModel
      .query({ matchFighters })
      .using('matchFightersStartTime')
      .limit(20)
      .sort(SortOrder.descending)
      .exec();

    return matches.map(({ pk, sk, ...rest }) => rest);
  }

  async getMatches(): Promise<GetMatchResult[]> {
    const matches = await this.matchModel
      .query({ pk: 'match' })
      .limit(20)
      .sort(SortOrder.descending)
      .exec();

    return matches.map(({ pk, sk, ...rest }) => rest);
  }

  async getUserMatches(userId: string): Promise<GetUserMatchResult[]> {
    const matches = await this.userMatchModel
      .query({ pk: `match#${userId}` })
      .limit(20)
      .sort(SortOrder.descending)
      .exec();

    return matches.map(({ pk, sk, userId, ...rest }) => rest);
  }

  async setDailyClaimAmounts(dailyClaimAmounts: number[]) {
    await this.dailyClaimAmountsModel.create(
      {
        pk: 'dailyClaimAmounts',
        sk: 'dailyClaimAmounts',
        dailyClaimAmounts,
      },
      {
        return: 'item',
        overwrite: true,
      },
    );
  }

  async setDailyClaimStatus(
    userId: string,
    {
      dailyClaimStreak,
      nextClaimDate,
      claimExpiryDate,
    }: Pick<
      DailyClaimStatus,
      'dailyClaimStreak' | 'nextClaimDate' | 'claimExpiryDate'
    >,
  ) {
    await this.dailyClaimStatusModel.create(
      {
        pk: 'dailyClaimStatus',
        sk: userId,
        dailyClaimStreak,
        nextClaimDate,
        claimExpiryDate,
      },
      {
        return: 'item',
        overwrite: true,
      },
    );
  }

  async getDailyClaims(userId?: string) {
    const claimAmounts = await this.dailyClaimAmountsModel.get({
      pk: 'dailyClaimAmounts',
      sk: 'dailyClaimAmounts',
    });

    if (!claimAmounts) {
      return { dailyClaimAmounts: [] };
    }

    if (!userId) {
      return { dailyClaimAmounts: claimAmounts.dailyClaimAmounts };
    }

    const dailyClaimStatusKey = {
      pk: 'dailyClaimStatus',
      sk: userId,
    };

    let dailyClaimStatus: DailyClaimStatus =
      await this.dailyClaimStatusModel.get(dailyClaimStatusKey);
    if (!dailyClaimStatus) {
      dailyClaimStatus = {
        ...dailyClaimStatusKey,
        dailyClaimStreak: 0,
      };
    }

    const { dailyClaimStreak, nextClaimDate, claimExpiryDate } =
      dailyClaimStatus;
    return {
      dailyClaimAmounts: claimAmounts.dailyClaimAmounts,
      dailyClaimStreak,
      nextClaimDate,
      claimExpiryDate,
    };
  }
}
