import { Injectable, Logger } from '@nestjs/common';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendBrokerCommand } from 'broker-comms';
import { CreditMessage } from 'cashier-messages';
import { ActivityStreamService } from '@/activityStream/activityStream.service';
import dayjs from '@/dayjs';
import { SeriesConfig } from '@/series/seriesConfig.model';
import { GatewayManagerService } from '@/gatewayManager/gatewayManager.service';
import { MatchResultEvent } from 'core-messages';
import { MatchPersistenceService } from './matchPersistence.service';
import { TournamentService } from '@/tournament/tournament.service';
import {
  MatchCompletedActivityEvent,
  WinActivityEvent,
} from '@/activityStream';

@Injectable()
export class MatchBettingService {
  private readonly logger: Logger = new Logger(MatchBettingService.name);

  constructor(
    private readonly matchPersistenceService: MatchPersistenceService,
    private readonly broker: NatsJetStreamClientProxy,
    private readonly activityStreamService: ActivityStreamService,
    private readonly gatewayManagerService: GatewayManagerService,
    private readonly tournamentService: TournamentService,
  ) {}

  async getBets(matchId: string) {
    return this.matchPersistenceService.getBets(matchId);
  }

  async distributeWinnings(
    seriesCodeName: string,
    matchId: string,
    winningFighter: { displayName: string; codeName: string },
    priceDelta: Record<
      string,
      {
        relative: number;
        absolute: number;
      }
    >,
    seriesConfig: SeriesConfig,
    startTime: string,
  ) {
    this.logger.log(
      `Distributing winnings, winning fighter is '${winningFighter}'`,
    );
    const losingFighter = seriesConfig.fighters.find(
      (fighter) => fighter.codeName !== winningFighter.codeName,
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
      await sendBrokerCommand(
        this.broker,
        new CreditMessage(userId, amount, 'WIN'),
      );

      const betAmount = bets
        .filter((x) => x.userId === userId)
        .reduce((acc, bet) => acc + bet.amount, 0);

      // Calculate net winnings
      const netWinAmount = Math.floor(amount - betAmount);
      if (netWinAmount > 0) {
        this.tournamentService.trackWin({
          userId,
          timestamp: dayjs.utc().toISOString(),
          netWinAmount,
        });
      }

      const timestamp =
        await this.matchPersistenceService.createUserMatchResult(
          matchId,
          userId,
          Math.floor(amount),
        );

      await this.gatewayManagerService.emitToClient(
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

      this.activityStreamService.track(
        new WinActivityEvent(
          userId,
          Math.floor(amount),
          winningFighter!.displayName,
        ),
      );
    }

    for (const loserUserId of losers) {
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

      await this.gatewayManagerService.emitToClient(
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

    const winnerTokenPriceDelta = priceDelta[winningFighter.codeName];
    const loserTokenPriceDelta = priceDelta[losingFighter.codeName];

    this.activityStreamService.track(
      new MatchCompletedActivityEvent(
        winningFighter.displayName,
        losingFighter.displayName,
        winnerTokenPriceDelta?.relative,
        loserTokenPriceDelta?.relative,
        totalWinPool,
      ),
    );
  }
}
