import { Injectable } from '@nestjs/common';
import { SortOrder } from 'dynamoose/dist/General';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Tournament, TournamentEntry } from 'src/interfaces';
import { Key } from 'src/interfaces/key.interface';
import { UserProfilesQueryStoreService } from './userProfiles.service';
import { RedisCacheService } from 'global-cache';

@Injectable()
export class TournamentQueryStoreService {
  constructor(
    private readonly cache: RedisCacheService,
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

    if (tournamentEntryWinAmount) {
      await this.cache.zadd(
        `tournamentEntryWinAmount:${tournament}`,
        tournamentEntryWinAmount,
        userId,
      );
    }

    if (xp) {
      await this.cache.zadd(`tournamentEntryXp:${tournament}`, xp, userId);
    }
  }

  async getUserLeaderboardRank(
    tournamentCodeName: string,
    type: 'winAmount' | 'xp',
    userId: string,
  ) {
    const index = `tournamentEntry${type === 'winAmount' ? 'WinAmount' : 'Xp'}:${tournamentCodeName}`;
    const rank = await this.cache.zrevrank(index, userId);
    const score = await this.cache.zscore(index, userId);

    const userProfile = await this.userProfilesService.getUserProfile(userId);

    return {
      rank: rank + 1,
      score,
      walletAddress: userProfile.primaryWalletAddress,
      username: userProfile.username,
    };
  }

  async getLeaderboardBySearchQuery(
    tournamentCodeName: string,
    type: 'winAmount' | 'xp',
    searchQuery: string,
  ) {
    const index = `tournamentEntry${type === 'winAmount' ? 'WinAmount' : 'Xp'}:${tournamentCodeName}`;

    const userIds =
      await this.userProfilesService.getUserIdsByPartialUsername(searchQuery);
    if (userIds.length === 0) {
      return [];
    }

    const rankAndScore = (pipeline: any) => {
      pipeline.zrevrank(index, userIds);
      pipeline.zscore(index, userIds);
    };

    const results = await this.cache.pipeline(rankAndScore);

    const parsedResults = [];
    for (let i = 0; i < results.length; i += 2) {
      const rank = results[i][1];
      const score = results[i + 1][1];
      const userId = userIds[i / 2];
      parsedResults.push({ userId, rank, score });
    }

    const userProfiles = await this.userProfilesService.getUserIdentifiers(
      parsedResults.map((r) => r.userId),
    );

    return parsedResults.map((r) => ({
      rank: r.rank + 1,
      [type === 'winAmount' ? 'winAmount' : 'xp']: r.score,
      walletAddress: userProfiles[r.userId].primaryWalletAddress,
      username: userProfiles[r.userId].username,
    }));
  }

  async getCurrentTournamentLeaderboard(
    date: string,
    type: 'winAmount' | 'xp' = 'winAmount',
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
      xp: string;
    }[];
    totalCount?: number;
    currentUserItem?: {
      rank: number;
      walletAddress: string;
      winAmount?: string;
      xp?: string;
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

    const userRank = userId
      ? await this.getUserLeaderboardRank(codeName, type, userId)
      : null;

    let items = [];
    if (searchQuery) {
      items = await this.getLeaderboardBySearchQuery(
        codeName,
        type,
        searchQuery,
      );
    } else {
      const index = `tournamentEntry${type === 'winAmount' ? 'WinAmount' : 'Xp'}:${codeName}`;

      const result = await this.cache.zrevrange(
        index,
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize - 1,
        true,
      );

      const userIds = result.filter((_, i) => i % 2 === 0);

      const userIdentifiers =
        await this.userProfilesService.getUserIdentifiers(userIds);

      let rank = (pageNumber - 1) * pageSize + 1;
      for (let i = 0; i < result.length; i += 2) {
        const userId = result[i];
        const score = result[i + 1];

        const { username, primaryWalletAddress } = userIdentifiers[userId];

        items.push({
          rank,
          walletAddress: primaryWalletAddress,
          username,
          [type === 'winAmount' ? 'winAmount' : 'xp']: score,
        });

        rank += 1;
      }
    }

    let currentUserItem = null;
    if (userRank) {
      currentUserItem = {
        rank: userRank.rank,
        walletAddress: userRank.walletAddress,
      };
      if (type === 'winAmount') {
        currentUserItem.winAmount = userRank.score;
      }
      if (type === 'xp') {
        currentUserItem.xp = userRank.score;
      }
    }

    return {
      items,
      currentUserItem,
      displayName,
      description,
      prizes,
      startDate,
      endDate,
      currentRound,
    };

    // if (searchQuery) {
    //   return null; // todo
    //   // return await this.getLeaderboardBySearchQuery(
    //   //   tournamentCodeName,
    //   //   type,
    //   //   searchQuery,
    //   // );
    // }
    //
    // let items;
    // if (type === 'winAmount') {
    //   items = this.getWinAmountLeaderboard(
    //     tournamentCodeName,
    //     pageSize,
    //     pageNumber,
    //   );
    // }
    // if (type === 'xp') {
    //   items = this.getXpLeaderboard(tournamentCodeName, pageSize, pageNumber);
    // }
    //
    // const {
    //   codeName,
    //   displayName,
    //   description,
    //   prizes,
    //   startDate,
    //   endDate,
    //   currentRound,
    // } = tournament;
    //
    // let currentPage = 1;
    // let rank = 1;
    // let lastKey;
    // let currentUserItem;
    //
    // const index = 'pkTournamentEntryWinAmount';
    //
    // do {
    //   const query = this.tournamentEntryModel
    //     .query({
    //       pk: `tournamentEntry#${codeName}`,
    //     })
    //     .using(index)
    //     .limit(pageSize)
    //     .sort(SortOrder.descending);
    //
    //   if (lastKey) {
    //     query.startAt(lastKey);
    //   }
    //
    //   const response = await query.exec();
    //   lastKey = response.lastKey;
    //   currentPage += 1;
    //
    //   if (searchQuery) {
    //     const matches: (TournamentEntry & { rank: number })[] = [];
    //     for (const item of response) {
    //       let walletAddress = item.primaryWalletAddress;
    //       if (
    //         walletAddress &&
    //         walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
    //       ) {
    //         matches.push({ ...item, rank });
    //       }
    //
    //       rank++;
    //     }
    //
    //     const usernames = await this.userProfilesService.getUsernames(
    //       matches.map((m) => m.sk),
    //     );
    //
    //     return {
    //       displayName,
    //       description,
    //       prizes,
    //       startDate,
    //       endDate,
    //       currentRound,
    //       items: matches.map(
    //         ({
    //           sk,
    //           rank,
    //           primaryWalletAddress,
    //           tournamentEntryWinAmount,
    //           balance,
    //           xp,
    //         }) => ({
    //           rank,
    //           username: usernames[sk] ?? '',
    //           walletAddress: primaryWalletAddress,
    //           winAmount: tournamentEntryWinAmount?.toString() ?? '0',
    //           balance,
    //           xp: xp?.toString() ?? '0',
    //         }),
    //       ),
    //     };
    //   } else {
    //     const usernames = await this.userProfilesService.getUsernames(
    //       response.map((m) => m.sk),
    //     );
    //
    //     if (userId) {
    //       const userItemIndex = response.findIndex(
    //         (x) => x.sk === `account#${userId}`,
    //       );
    //       if (userItemIndex !== -1) {
    //         const userItem = response[userItemIndex];
    //         const userRank = rank + userItemIndex;
    //         currentUserItem = {
    //           rank: userRank,
    //           username: usernames[userItem.sk],
    //           walletAddress: userItem.primaryWalletAddress,
    //           balance: userItem.balance,
    //           xp: userItem.xp?.toString() ?? '0',
    //         };
    //       }
    //     }
    //
    //     if (currentPage > pageNumber) {
    //       const totalCount = 0; // todo
    //
    //       return {
    //         displayName,
    //         description,
    //         prizes,
    //         startDate,
    //         endDate,
    //         currentRound,
    //         totalCount,
    //         currentUserItem,
    //         items: response.map((item) => ({
    //           rank: rank++,
    //           username: usernames[item.sk],
    //           walletAddress: item.primaryWalletAddress,
    //           balance: item.balance,
    //           winAmount: item.tournamentEntryWinAmount?.toString() ?? '0',
    //           xp: item.xp?.toString() ?? '0',
    //         })),
    //       };
    //     } else {
    //       rank += response.length;
    //     }
    //   }
    // } while (lastKey);
    //
    // return {
    //   displayName,
    //   description,
    //   prizes,
    //   startDate,
    //   currentRound,
    //   endDate,
    //   totalCount: 0,
    //   items: [],
    // };
  }
}
