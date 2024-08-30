import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, Model, UpdatePartial } from 'nestjs-dynamoose';
import { Tournament } from './interfaces/tournament.interface';
import { Key } from '@/interfaces/key';
import dayjs from '@/dayjs';
import { TournamentQueryStoreService } from 'query-store';
import { TournamentEntry } from './interfaces/tournamentEntry.interface';
import { TournamentWinnings } from './interfaces/tournamentWinnings.interface';
import { Cron } from '@nestjs/schedule';
import { ActivityStreamService } from '@/activityStream';
import { WinXpActivityEvent } from '@/activityStream/events/winXpActivity.event';

@Injectable()
export class TournamentService {
  private readonly logger = new Logger(TournamentService.name);

  constructor(
    @InjectModel('tournament')
    private readonly tournamentModel: Model<Tournament, Key>,
    @InjectModel('tournamentEntry')
    private readonly tournamentEntryModel: Model<TournamentEntry, Key>,
    @InjectModel('tournamentWinnings')
    private readonly tournamentWinningsModel: Model<TournamentWinnings, Key>,
    private readonly tournamentQueryStore: TournamentQueryStoreService,
    private readonly activityStreamService: ActivityStreamService,
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

  async trackXp(userId: string, xp: number, timestamp: string) {
    if (xp === 0) {
      return;
    }

    const currentTournamentCodeName =
      await this.getTournamentCodeName(timestamp);

    if (currentTournamentCodeName) {
      await this.updateTournamentEntry({
        timestamp,
        tournament: currentTournamentCodeName,
        userId,
        xp,
      });
    }
  }

  async updateTournamentEntry({
    timestamp,
    tournament,
    userId,
    primaryWalletAddress,
    winAmount,
    betAmount,
    balance,
    xp,
  }: {
    timestamp: string;
    tournament: string;
    userId: string;
    primaryWalletAddress?: string;
    winAmount?: number;
    betAmount?: number;
    balance?: string;
    xp?: number;
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

    if (betAmount) {
      updateRecord = {
        ...updateRecord,
        $ADD: {
          entryBetAmount: betAmount,
        },
      };
    }

    if (xp) {
      updateRecord = {
        ...updateRecord,
        $ADD: {
          xp: xp,
        },
      };
    }

    let item = await this.tournamentEntryModel.update(
      {
        pk: `tournamentEntry#${tournament}`,
        sk: userId,
      },
      updateRecord,
      { return: 'item', returnValues: 'ALL_NEW' },
    );

    if (winAmount) {
      await this.tournamentWinningsModel.create({
        pk: `tournamentWinnings#${tournament}`,
        sk: `${userId}#${timestamp}`,
        tournament,
        userId,
        primaryWalletAddress: item.primaryWalletAddress,
        winAmount,
        createdAt: timestamp,
      });
    }

    await this.tournamentQueryStore.updateTournamentEntry({
      tournament,
      userId,
      primaryWalletAddress: item.primaryWalletAddress,
      // We get the winAmount from the update response,
      // as it will have the final amount
      tournamentEntryWinAmount: item.winAmount,
      balance: item.balance,
      xp: item.xp,
    });
  }

  async createTournament({
    codeName,
    displayName,
    description,
    startDate,
    rounds,
    prizes,
  }: {
    codeName: string;
    displayName: string;
    description: string;
    startDate: string;
    rounds: number;
    prizes: {
      title: string;
      description: string;
      imagePath?: string;
    }[];
  }) {
    // Calculate endDate
    const endDate = dayjs.utc(startDate).add(rounds, 'day').toISOString();

    const now = dayjs.utc().toISOString();

    await this.tournamentModel.create({
      pk: 'tournament',
      sk: codeName,
      startDate,
      endDate,
      rounds,
      currentRound: 1,
      displayName,
      description,
      prizes,
      createdAt: now,
      updatedAt: now,
    });

    await this.tournamentQueryStore.createTournament({
      codeName,
      displayName,
      description,
      startDate,
      endDate,
      prizes,
    });
  }

  async getCurrentTournament() {
    const currentTournamentCodeName = await this.getTournamentCodeName(
      dayjs.utc().toISOString(),
    );

    if (!currentTournamentCodeName) {
      return null;
    }

    return this.getTournament(currentTournamentCodeName);
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

  async updateTournament(
    codeName: string,
    data: Partial<{
      displayName: string;
      description: string;
      startDate: string;
      currentRound: number;
      rounds: number;
      prizes: {
        title: string;
        description: string;
        imagePath?: string;
      }[];
    }>,
  ) {
    const { startDate, rounds } = data;
    // Calculate endDate
    let endDate: string | undefined;
    if (startDate && rounds) {
      endDate = dayjs.utc(startDate).add(rounds, 'day').toISOString();
    }

    const update: UpdatePartial<Tournament> = { $SET: {} };
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        update['$SET'][key] = value;
      }
    }

    if (endDate) {
      update['$SET'].endDate = endDate;
    }

    const item = await this.tournamentModel.update(
      {
        pk: 'tournament',
        sk: codeName,
      },
      update,
      {
        return: 'item',
        returnValues: 'ALL_NEW',
      },
    );

    await this.tournamentQueryStore.updateTournament({
      codeName,
      displayName: item.displayName,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate,
      currentRound: item.currentRound,
      prizes: item.prizes,
    });
  }

  async processRoundChange() {
    const currentTournament = await this.getCurrentTournament();

    if (!currentTournament) {
      return;
    }

    const { currentRound } = currentTournament;
    const now = dayjs.utc();
    const startDate = dayjs.utc(currentTournament.startDate);

    let expectedRound = now.diff(startDate, 'day') + 1;
    if (
      expectedRound === currentTournament.currentRound ||
      expectedRound > currentTournament.rounds
    ) {
      return;
    }

    // We only process one round change at a time
    expectedRound = currentRound + 1;

    this.logger.log(
      `Processing round change for ${currentTournament.codeName} from round ${currentRound} to round ${expectedRound}`,
    );

    await this.updateTournament(currentTournament.codeName, {
      currentRound: expectedRound,
    });

    // Get all winnings for currentRound
    const roundStart = startDate.add(currentRound - 1, 'day');
    const roundEnd = startDate.add(currentRound, 'day');
    const winnings = await this.tournamentWinningsModel
      .query({
        pk: `tournamentWinnings#${currentTournament.codeName}`,
        createdAt: {
          between: [roundStart.toISOString(), roundEnd.toISOString()],
        },
      })
      .using('pkCreatedAt')
      .all(10)
      .exec();

    // Group winnings by user
    const winningsByUser = winnings.reduce(
      (acc, curr) => {
        if (!acc[curr.userId]) {
          acc[curr.userId] = 0;
        }

        acc[curr.userId] += curr.winAmount;

        return acc;
      },
      {} as Record<string, number>,
    );

    // Get top 100 winners
    const topWinners = Object.entries(winningsByUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 100);

    // Reduce tournamentEntry win amounts by winnings for the round.
    // This ensures that any winnings from the next round are retained.
    for (const [userId, winAmount] of Object.entries(winningsByUser)) {
      let winAmountCreditedXp = Math.floor(winAmount / 100) * 100;

      let updateExpression: {
        $ADD: {
          winAmount: number;
          winAmountCreditedXp: number;
          xp?: number;
        };
      } = {
        $ADD: {
          winAmount: -winAmount,
          winAmountCreditedXp: -winAmountCreditedXp,
        },
      };

      // 1st place = 150 XP
      // 2nd place = 100 XP
      // 3rd place = 50 XP
      // 4th - 100th place = 25 XP

      let xp = 0;
      if (topWinners.length > 0 && userId === topWinners[0][0]) {
        xp = 150;
      } else if (topWinners.length > 1 && userId === topWinners[1][0]) {
        xp = 100;
      } else if (topWinners.length > 2 && userId === topWinners[2][0]) {
        xp = 50;
      } else if (topWinners.map(([id]) => id).includes(userId)) {
        xp = 25;
      }

      if (xp > 0) {
        updateExpression.$ADD.xp = xp;
      }

      const item = await this.tournamentEntryModel.update(
        {
          pk: `tournamentEntry#${currentTournament.codeName}`,
          sk: userId,
        },
        updateExpression,
        {
          return: 'item',
          returnValues: 'ALL_NEW',
        },
      );

      await this.tournamentQueryStore.updateTournamentEntry({
        tournament: currentTournament.codeName,
        userId,
        primaryWalletAddress: item.primaryWalletAddress,
        tournamentEntryWinAmount: item.winAmount,
        balance: item.balance,
        xp: item.xp,
      });
    }
  }
}
