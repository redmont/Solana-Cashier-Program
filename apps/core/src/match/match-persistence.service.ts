import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from 'src/interfaces/key';
import { Match } from './interfaces/match.interface';
import { Bet } from './interfaces/bet.interface';
import { v4 as uuid } from 'uuid';
import { QueryStoreService } from 'query-store';

@Injectable()
export class MatchPersistenceService {
  constructor(
    @InjectModel('match') private readonly matchModel: Model<Match, Key>,
    @InjectModel('bet') private readonly betModel: Model<Bet, Key>,
    private readonly queryStore: QueryStoreService,
  ) {}

  async saveState(
    id: string,
    seriesCodeName: string,
    state: any,
    context: any,
  ) {
    let matchItem: Match = await this.matchModel.get({
      pk: 'match',
      sk: id,
    });
    if (!matchItem) {
      matchItem = {
        pk: 'match',
        sk: id,
        seriesCodeName,
        startTime: '',
      };
    }

    const savedMatch = await this.matchModel.create(
      {
        ...matchItem,
        state,
        startTime: context.startTime ? context.startTime.toISO() : '',
      },
      {
        overwrite: true,
        return: 'item',
      },
    );

    console.log('state is:', state);

    await this.queryStore.saveMatch(seriesCodeName, {
      state,
      bets: [],
    });
  }

  async createBet(
    matchId: string,
    userId: string,
    amount: number,
    fighter: string,
  ) {
    const id = uuid();

    await this.betModel.create({
      pk: `bet#${matchId}`,
      sk: id,
      userId,
      amount,
      fighter,
    });

    return id;
  }

  async getBets(matchId: string) {
    console.log('GEt bets for match ID', matchId);
    return await this.betModel
      .query({
        pk: `bet#${matchId}`,
      })
      .exec();
  }
}
