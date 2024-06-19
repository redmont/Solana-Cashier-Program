import { Injectable } from '@nestjs/common';
import { InjectModel, Model, UpdatePartial } from 'nestjs-dynamoose';
import { Tournament } from './interfaces/tournament.interface';
import { Key } from '@/interfaces/key';
import dayjs from '@/dayjs';
import { QueryStoreService } from 'query-store';
import { TournamentEntry } from './interfaces/tournamentEntry.interface';

@Injectable()
export class TournamentService {
  constructor(
    @InjectModel('tournament')
    private readonly tournamentModel: Model<Tournament, Key>,
    @InjectModel('tournamentEntry')
    private readonly tournamentEntryModel: Model<TournamentEntry, Key>,
    private readonly queryStore: QueryStoreService,
  ) {}

  /**
   * Get all tournaments.
   * @returns Array of tournaments.
   */
  async getTournaments() {
    const tournaments = await this.tournamentModel
      .query({ pk: 'tournament' })
      .exec();

    return tournaments.map(({ pk, sk, ...rest }) => ({
      ...rest,
      codeName: sk,
    }));
  }

  /**
   * Retrieves the code name of the current tournament based on the provided date.
   * The current tournament is the first one where the provided date is between the start and end date.
   * @param date ISO8601 date to check for the current tournament.
   * @returns The code name of the current tournament, or null if no current tournament is found.
   */
  async getTournamentCodeName(date: string) {
    const tournaments = await this.tournamentModel
      .query({
        pk: 'tournament',
        startDate: { le: date },
      })
      .using('pkStartDate')
      .where('endDate')
      .ge(date)
      .exec();

    return tournaments.length > 0 ? tournaments[0].sk : null;
  }

  async trackWin({
    userId,
    timestamp,
    netWinAmount,
  }: {
    userId: string;
    timestamp: string;
    netWinAmount: number;
  }) {
    const currentTournamentCodeName =
      await this.getTournamentCodeName(timestamp);

    if (currentTournamentCodeName) {
      await this.updateTournamentEntry({
        timestamp: timestamp,
        tournament: currentTournamentCodeName,
        userId: userId,
        winAmount: netWinAmount,
      });
    }
  }

  async updateTournamentEntry({
    timestamp,
    tournament,
    userId,
    primaryWalletAddress,
    winAmount,
    balance,
  }: {
    timestamp: string;
    tournament: string;
    userId: string;
    primaryWalletAddress?: string;
    winAmount?: number;
    balance?: string;
  }) {
    let updateRecord: UpdatePartial<TournamentEntry> = {
      $SET: { updatedAt: timestamp },
    };

    if (primaryWalletAddress !== undefined) {
      updateRecord.$SET.primaryWalletAddress = primaryWalletAddress;
    }

    if (balance !== undefined) {
      updateRecord.$SET.balance = balance;
    }

    if (winAmount) {
      updateRecord = {
        ...updateRecord,
        $ADD: {
          winAmount,
        },
      };
    }

    const item = await this.tournamentEntryModel.update(
      {
        pk: `tournamentEntry#${tournament}`,
        sk: userId,
      },
      updateRecord,
      { return: 'item', returnValues: 'ALL_NEW' },
    );

    await this.queryStore.updateTournamentEntry({
      tournament,
      userId,
      primaryWalletAddress: item.primaryWalletAddress,
      // We get the winAmount from the update response,
      // as it will have the final amount
      tournamentEntryWinAmount: item.winAmount,
      balance: item.balance,
    });
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
      startDate,
      endDate,
      displayName,
      description,
      prizes,
      createdAt: dayjs.utc().toISOString(),
      updatedAt: dayjs.utc().toISOString(),
    });

    await this.queryStore.createTournament({
      codeName,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
    });
  }

  async getTournament(codeName: string) {
    const tournament = await this.tournamentModel.get({
      pk: 'tournament',
      sk: codeName,
    });

    if (!tournament) {
      return null;
    }

    const { pk, sk, ...rest } = tournament;

    return {
      ...rest,
      codeName: sk,
    };
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
        createdAt: dayjs.utc().toISOString(),
        updatedAt: dayjs.utc().toISOString(),
      },
    );

    await this.queryStore.updateTournament({
      codeName,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
    });
  }
}
