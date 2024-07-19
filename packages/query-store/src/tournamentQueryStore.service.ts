import { Injectable } from '@nestjs/common';
import { SortOrder } from 'dynamoose/dist/General';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Tournament, TournamentEntry } from 'src/interfaces';
import { Key } from 'src/interfaces/key.interface';
import { UserProfilesQueryStoreService } from './userProfiles.service';

@Injectable()
export class TournamentQueryStoreService {
  constructor(
    private readonly userProfilesService: UserProfilesQueryStoreService,
    @InjectModel('tournament')
    private readonly tournamentModel: Model<Tournament, Key>,
    @InjectModel('tournamentEntry')
    private readonly tournamentEntryModel: Model<TournamentEntry, Key>,
  ) {}

  private async getCurrentTournament(date: string): Promise<
    Pick<
      Tournament,
      | 'displayName'
      | 'description'
      | 'startDate'
      | 'endDate'
      | 'prizes'
      | 'currentRound'
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

    const {
      sk,
      displayName,
      description,
      startDate,
      endDate,
      currentRound,
      prizes,
    } = tournaments[tournaments.length - 1];

    return {
      codeName: sk,
      displayName,
      description,
      startDate,
      endDate,
      currentRound,
      prizes,
    };
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
      currentRound: 1,
      prizes,
    });
  }

  async updateTournament({
    codeName,
    displayName,
    description,
    startDate,
    endDate,
    currentRound,
    prizes,
  }: {
    codeName: string;
    displayName: string;
    description: string;
    startDate: string;
    endDate: string;
    currentRound: number;
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
        currentRound,
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
    xp,
  }: {
    tournament: string;
    userId: string;
    primaryWalletAddress: string;
    tournamentEntryWinAmount: number;
    balance: string;
    xp: number;
  }) {
    await this.tournamentEntryModel.create(
      {
        pk: `tournamentEntry#${tournament}`,
        sk: userId,
        primaryWalletAddress,
        tournamentEntryWinAmount,
        balance,
        xp,
      },
      {
        overwrite: true,
        return: 'item',
      },
    );
  }

  async getCurrentTournamentLeaderboard(
    date: string,
    sortBy: 'winAmount' | 'xp' = 'xp',
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
    currentRound: number;
    items: {
      rank: number;
      walletAddress: string;
      winAmount: string;
      balance: string;
      xp: string;
    }[];
    totalCount?: number;
    currentUserItem?: {
      rank: number;
      walletAddress: string;
      winAmount: string;
      balance: string;
      xp: string;
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
        currentRound: 0,
        totalCount: 0,
        items: [],
      };
    }

    const {
      codeName,
      displayName,
      description,
      prizes,
      startDate,
      endDate,
      currentRound,
    } = tournament;

    let currentPage = 1;
    let rank = 1;
    let lastKey;
    let currentUserItem;

    const index = 'pkTournamentEntryWinAmount';

    do {
      const query = this.tournamentEntryModel
        .query({
          pk: `tournamentEntry#${codeName}`,
        })
        .using(index)
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

        const usernames = await this.userProfilesService.getUsernames(
          matches.map((m) => m.sk),
        );

        return {
          displayName,
          description,
          prizes,
          startDate,
          endDate,
          currentRound,
          items: matches.map(
            ({
              sk,
              rank,
              primaryWalletAddress,
              tournamentEntryWinAmount,
              balance,
              xp,
            }) => ({
              rank,
              username: usernames[sk] ?? '',
              walletAddress: primaryWalletAddress,
              winAmount: tournamentEntryWinAmount?.toString() ?? '0',
              balance,
              xp: xp?.toString() ?? '0',
            }),
          ),
        };
      } else {
        const usernames = await this.userProfilesService.getUsernames(
          response.map((m) => m.sk),
        );

        if (userId) {
          const userItemIndex = response.findIndex(
            (x) => x.sk === `account#${userId}`,
          );
          if (userItemIndex !== -1) {
            const userItem = response[userItemIndex];
            const userRank = rank + userItemIndex;
            currentUserItem = {
              rank: userRank,
              username: usernames[userItem.sk] ?? '',
              walletAddress: userItem.primaryWalletAddress,
              balance: userItem.balance,
              xp: userItem.xp?.toString() ?? '0',
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
            currentRound,
            totalCount,
            currentUserItem,
            items: response.map((item) => ({
              rank: rank++,
              username: usernames[item.sk] ?? '',
              walletAddress: item.primaryWalletAddress,
              balance: item.balance,
              winAmount: item.tournamentEntryWinAmount?.toString() ?? '0',
              xp: item.xp?.toString() ?? '0',
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
      currentRound,
      endDate,
      totalCount: 0,
      items: [],
    };
  }
}
