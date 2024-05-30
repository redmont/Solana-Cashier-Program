import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchPersistenceService } from './matchPersistence.service';
import { sendBrokerMessage } from 'broker-comms';
import { ClientProxy } from '@nestjs/microservices';
import { CreditMessage } from 'cashier-messages';
import { ActivityStreamService } from '@/activityStream/activityStream.service';
import dayjs from '@/dayjs';
import { SeriesConfig } from '@/series/seriesConfig.model';
import { GatewayManagerService } from '@/gatewayManager/gatewayManager.service';
import { MatchResultEvent } from 'core-messages';

@Injectable()
export class MatchBettingService {
  private readonly logger: Logger = new Logger(MatchBettingService.name);

  constructor(
    private readonly matchPersistenceService: MatchPersistenceService,
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly activityStreamService: ActivityStreamService,
    private readonly gatewayManagerService: GatewayManagerService,
  ) {}

  async getBets(matchId: string) {
    return this.matchPersistenceService.getBets(matchId);
  }

  async distributeWinnings(
    seriesCodeName: string,
    matchId: string,
    winningFighter: { displayName: string; codeName: string },
    seriesConfig: SeriesConfig,
    startTime: string,
  ) {
    this.logger.log(
      `Distributing winnings, winning fighter is '${winningFighter}'`,
    );
    const bets = await this.matchPersistenceService.getBets(matchId);

    // Winnings come from the total amount bet on the losing fighter
    const totalWinPool =
      bets
        .filter((bet) => bet.fighter !== winningFighter?.codeName)
        .reduce((acc, bet) => acc + bet.amount, 0) * 0.95;

    const totalWinningWagers = bets
      .filter((bet) => bet.fighter === winningFighter?.codeName)
      .reduce((acc, bet) => acc + bet.amount, 0);

    this.logger.log(`Win pool is: '${totalWinPool}'`);

    const wins = [];

    // Calculate win amount for each bet
    for (const bet of bets.filter(
      (bet) => bet.fighter === winningFighter?.codeName,
    )) {
      // Win is proportional to the total amount bet on the winning fighter
      const poolWinnings =
        totalWinningWagers > 0
          ? (bet.amount / totalWinningWagers) * totalWinPool
          : 0;

      // The win amount is the original bet amount plus the proportional winnings
      const winAmount = bet.amount + poolWinnings;

      if (winAmount > 0) {
        wins.push({ userId: bet.userId, winAmount });
      }
    }

    // Sum up the wins per user
    const winsPerUser = wins.reduce((acc, win) => {
      acc[win.userId] = (acc[win.userId] || 0) + win.winAmount;
      return acc;
    }, {});

    // Losers are those that bet on the losing fighter, and have not had any winning bets
    const losers = bets
      .filter(
        (bet) =>
          bet.fighter !== winningFighter?.codeName &&
          !Object.keys(winsPerUser).includes(bet.userId),
      )
      .map((bet) => bet.userId)
      .filter((value, index, self) => self.indexOf(value) === index);

    // Augment fighters with bet counts
    const fightersWithBetCounts = seriesConfig.fighters.map((fighter) => {
      const betCount = bets.filter(
        (bet) => bet.fighter === fighter.codeName,
      ).length;
      return { ...fighter, betCount };
    });

    for (const userId of Object.keys(winsPerUser)) {
      const amount = winsPerUser[userId];

      // Send credit message to cashier
      await sendBrokerMessage(
        this.broker,
        new CreditMessage(userId, amount, 'WIN'),
      );

      await this.activityStreamService.track(
        seriesCodeName,
        matchId,
        dayjs.utc(),
        'win',
        {
          amount: Math.floor(amount),
          winningFighter: winningFighter?.displayName,
        },
        userId,
      );

      const betAmount = bets
        .filter((x) => x.userId === userId)
        .reduce((acc, bet) => acc + bet.amount, 0);

      const timestamp =
        await this.matchPersistenceService.createUserMatchResult(
          matchId,
          userId,
          Math.floor(amount),
        );

      this.gatewayManagerService.emitToClient(
        userId,
        MatchResultEvent.messageType,
        new MatchResultEvent(
          timestamp,
          userId,
          matchId,
          betAmount.toString(),
          Math.floor(amount).toString(),
          winningFighter.codeName,
        ),
      );

      // Create user match history
      await this.matchPersistenceService.recordUserMatchHistory({
        userId,
        betAmount: betAmount.toString(),
        winAmount: Math.floor(amount).toString(),
        seriesCodeName,
        matchId,
        startTime,
        winner: winningFighter,
        fighters: fightersWithBetCounts,
      });
    }

    for (const loserUserId of losers) {
      await this.activityStreamService.track(
        seriesCodeName,
        matchId,
        dayjs.utc(),
        'loss',
        {
          winningFighter: winningFighter?.displayName,
        },
        loserUserId,
      );

      const betAmount = Math.floor(
        bets
          .filter((x) => x.userId === loserUserId)
          .reduce((acc, bet) => acc + bet.amount, 0),
      );

      const timestamp =
        await this.matchPersistenceService.createUserMatchResult(
          matchId,
          loserUserId,
          0,
        );

      this.gatewayManagerService.emitToClient(
        loserUserId,
        MatchResultEvent.messageType,
        new MatchResultEvent(
          timestamp,
          loserUserId,
          matchId,
          betAmount.toString(),
          '0',
          winningFighter.codeName,
        ),
      );

      // Create user match history
      await this.matchPersistenceService.recordUserMatchHistory({
        userId: loserUserId,
        betAmount: betAmount.toString(),
        winAmount: '0',
        seriesCodeName,
        matchId,
        startTime,
        winner: winningFighter,
        fighters: fightersWithBetCounts,
      });
    }

    // Record fight history
    await this.matchPersistenceService.recordFightHistory({
      seriesCodeName,
      matchId,
      startTime,
      winner: winningFighter,
      fighters: fightersWithBetCounts,
    });
  }
}
