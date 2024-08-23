import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { v4 as uuid } from 'uuid';
import { QueryStoreService } from 'query-store';
import dayjs from '@/dayjs';
import { Key } from 'src/interfaces/key';
import { Match } from './interfaces/match.interface';
import { Bet } from './interfaces/bet.interface';
import { UserMatchResult } from './interfaces/userMatchResult.interface';
import { UserMatch } from './interfaces/userMatch.interface';

@Injectable()
export class MatchPersistenceService {
  constructor(
    @InjectModel('match') private readonly matchModel: Model<Match, Key>,
    @InjectModel('userMatch')
    private readonly userMatchModel: Model<UserMatch, Key>,
    @InjectModel('bet') private readonly betModel: Model<Bet, Key>,
    @InjectModel('userMatchResult')
    private readonly userMatchResultModel: Model<UserMatchResult, Key>,
    private readonly queryStore: QueryStoreService,
  ) {}

  async recordFightHistory({
    seriesCodeName,
    matchId,
    startTime,
    fighters,
    winner,
    winnerTokenPriceDelta,
    loserTokenPriceDelta,
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
    winnerTokenPriceDelta: {
      relative: number;
      absolute: number;
    };
    loserTokenPriceDelta: {
      relative: number;
      absolute: number;
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
      winnerTokenPriceDelta,
      loserTokenPriceDelta,
    });

    await this.queryStore.createMatch({
      seriesCodeName,
      matchId,
      startTime,
      fighters,
      winner,
    });
  }

  async recordUserMatchHistory({
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

    await this.queryStore.createUserMatch({
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

  async createBet(
    matchId: string,
    userId: string,
    amount: number,
    fighter: string,
  ) {
    const id = uuid();
    const createdAt = dayjs.utc().toISOString();

    await this.betModel.create({
      pk: `bet#${matchId}`,
      sk: id,
      createdAt,
      userId,
      amount,
      fighter,
    });

    return id;
  }

  async getBets(matchId: string) {
    return await this.betModel
      .query({
        pk: `bet#${matchId}`,
      })
      .exec();
  }

  async createUserMatchResult(matchId: string, userId: string, amount: number) {
    const createdAt = dayjs.utc().toISOString();
    await this.userMatchResultModel.create({
      pk: `userMatchResult#${matchId}`,
      sk: userId,
      amount,
      createdAt,
    });

    await this.queryStore.createUserMatchResult(matchId, userId, amount);

    return createdAt;
  }
}
