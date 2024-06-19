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
import { Tournament } from './interfaces/tournament.interface';
import { TournamentEntry } from './interfaces/tournamentEntry.interface';
import { SortOrder } from 'dynamoose/dist/General';

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
    @InjectModel('tournament')
    private readonly tournamentModel: Model<Tournament, Key>,
    @InjectModel('tournamentEntry')
    private readonly tournamentEntryModel: Model<TournamentEntry, Key>,
  ) {}

  private async getCurrentTournament(date: string): Promise<
    Pick<
      Tournament,
      'displayName' | 'description' | 'startDate' | 'endDate' | 'prizes'
    > & {
      codeName: string;
    }
  > {
    const tournaments = await this.tournamentModel
      .query({
        pk: 'tournament',
        startDate: { le: date },
      })
      .using('pkStartDate')
      .exec();

    if (tournaments.length === 0) {
      return null;
    }

    const { sk, displayName, description, startDate, endDate, prizes } =
      tournaments[tournaments.length - 1];

    return {
      codeName: sk,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
    };
  }

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
        bets: [],
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

  async createTournament({
    codeName,
    displayName,
    description,
    startDate,
    endDate,
    prizes,
  }: {
    codeName: string;
    displayName: string;
    description: string;
    startDate: string;
    endDate: string;
    prizes: {
      title: string;
      description: string;
    }[];
  }) {
    await this.tournamentModel.create({
      pk: 'tournament',
      sk: codeName,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
    });
  }

  async updateTournament({
    codeName,
    displayName,
    description,
    startDate,
    endDate,
    prizes,
  }: {
    codeName: string;
    displayName: string;
    description: string;
    startDate: string;
    endDate: string;
    prizes: {
      title: string;
      description: string;
    }[];
  }) {
    await this.tournamentModel.update(
      {
        pk: 'tournament',
        sk: codeName,
      },
      {
        displayName,
        description,
        startDate,
        endDate,
        prizes,
      },
    );
  }

  async updateTournamentEntry({
    tournament,
    userId,
    primaryWalletAddress,
    tournamentEntryWinAmount,
    balance,
  }: {
    tournament: string;
    userId: string;
    primaryWalletAddress: string;
    tournamentEntryWinAmount: number;
    balance: string;
  }) {
    await this.tournamentEntryModel.create(
      {
        pk: `tournamentEntry#${tournament}`,
        sk: userId,
        primaryWalletAddress,
        tournamentEntryWinAmount,
        balance,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async getCurrentTournamentLeaderboard(
    date: string,
    pageSize: number = 50,
    pageNumber: number = 1,
    userId: string = null,
    searchQuery: string = null,
  ): Promise<{
    displayName: string;
    description: string;
    prizes: {
      title: string;
      description: string;
    }[];
    startDate: string;
    endDate: string;
    items: {
      rank: number;
      walletAddress: string;
      winAmount: string;
      balance: string;
    }[];
    totalCount?: number;
    currentUserItem?: {
      rank: number;
      walletAddress: string;
      winAmount: string;
      balance: string;
    };
  }> {
    const tournament = await this.getCurrentTournament(date);

    if (!tournament) {
      return {
        displayName: null,
        description: null,
        prizes: [],
        startDate: null,
        endDate: null,
        totalCount: 0,
        items: [],
      };
    }

    const { codeName, displayName, description, prizes, startDate, endDate } =
      tournament;

    let currentPage = 1;
    let rank = 1;
    let lastKey;
    let currentUserItem;

    do {
      const query = this.tournamentEntryModel
        .query({
          pk: `tournamentEntry#${codeName}`,
        })
        .using('pkTournamentEntryWinAmount')
        .limit(pageSize)
        .sort(SortOrder.descending);
      if (lastKey) {
        query.startAt(lastKey);
      }

      const response = await query.exec();
      lastKey = response.lastKey;
      currentPage += 1;

      if (searchQuery) {
        const matches: (TournamentEntry & { rank: number })[] = [];
        for (const item of response) {
          let walletAddress = item.primaryWalletAddress;
          if (
            walletAddress &&
            walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            matches.push({ ...item, rank });
          }

          rank++;
        }

        return {
          displayName,
          description,
          prizes,
          startDate,
          endDate,
          items: matches.map(
            ({
              rank,
              primaryWalletAddress,
              tournamentEntryWinAmount,
              balance,
            }) => ({
              rank,
              walletAddress: primaryWalletAddress,
              winAmount: tournamentEntryWinAmount.toString(),
              balance,
            }),
          ),
        };
      } else {
        if (userId) {
          const userItemIndex = response.findIndex(
            (x) => x.sk === `account#${userId}`,
          );
          if (userItemIndex !== -1) {
            const userItem = response[userItemIndex];
            const userRank = rank + userItemIndex;
            currentUserItem = {
              rank: userRank,
              walletAddress: userItem.primaryWalletAddress,
              balance: userItem.balance,
            };
          }
        }

        if (currentPage > pageNumber) {
          const totalCount = 0; // todo

          return {
            displayName,
            description,
            prizes,
            startDate,
            endDate,
            totalCount,
            currentUserItem,
            items: response.map((item) => ({
              rank: rank++,
              walletAddress: item.primaryWalletAddress,
              balance: item.balance,
              winAmount: item.tournamentEntryWinAmount.toString(),
            })),
          };
        } else {
          rank += response.length;
        }
      }
    } while (lastKey);

    return {
      displayName,
      description,
      prizes,
      startDate,
      endDate,
      totalCount: 0,
      items: [],
    };
  }
}
