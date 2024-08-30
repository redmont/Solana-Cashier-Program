import { Injectable, Logger } from '@nestjs/common';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { sendBrokerCommand } from 'broker-comms';
import { CreditMessage } from 'cashier-messages';
import { ActivityStreamService } from '@/activityStream/activityStream.service';
import { SeriesConfig } from '@/series/seriesConfig.model';
import { GatewayManagerService } from '@/gatewayManager/gatewayManager.service';
import { MatchResultEvent } from 'core-messages';
import { MatchPersistenceService } from './matchPersistence.service';
import { TournamentService } from '@/tournament/tournament.service';
import {
  MatchCompletedActivityEvent,
  PlayerMatchCompletedActivityEvent,
  WinActivityEvent,
} from '@/activityStream';
import { UsersService } from '@/users/users.service';

@Injectable()
export class MatchBettingService {
  private readonly logger: Logger = new Logger(MatchBettingService.name);

  constructor(
    private readonly matchPersistenceService: MatchPersistenceService,
    private readonly broker: NatsJetStreamClientProxy,
    private readonly activityStreamService: ActivityStreamService,
    private readonly gatewayManagerService: GatewayManagerService,
    private readonly usersService: UsersService,
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
    const winningFighterTicker = seriesConfig.fighters.find(
      (fighter) => fighter.codeName === winningFighter.codeName,
    )?.ticker;

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

    // Calculate net bet amounts for each user.
    // The net bet amount is the absolute value of sum of bets on fighter 1 minus the sum of bets on fighter 2.
    // Betting on both sides negates the bet amount.
    const betsByUser = bets.reduce(
      (acc, bet) => {
        const userId = bet.userId;
        if (!acc[userId]) {
          acc[userId] = [bet];
        } else {
          acc[userId].push(bet);
        }
        return acc;
      },
      {} as Record<string, any[]>,
    );

    for (const userId of Object.keys(betsByUser)) {
      let netBetAmount = 0;

      const bets = betsByUser[userId];
      const betAmountsPerFighter = bets.reduce(
        (acc, bet) => {
          const fighter = bet.fighter;
          if (!acc[fighter]) {
            acc[fighter] = bet.amount;
          } else {
            acc[fighter] += bet.amount;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      for (let i = 0; i < Object.keys(betAmountsPerFighter).length; i++) {
        if (i === 0) {
          netBetAmount =
            betAmountsPerFighter[Object.keys(betAmountsPerFighter)[0]];
        } else {
          // Reduce bet amount
          netBetAmount -=
            betAmountsPerFighter[Object.keys(betAmountsPerFighter)[i]];
        }
      }

      netBetAmount = Math.abs(netBetAmount);

      const creditedXp = await this.usersService.creditXp(userId, netBetAmount);

      await this.tournamentService.trackXp(userId, creditedXp, startTime);

      if (creditedXp > 0) {
        this.activityStreamService.track(
          new PlayerMatchCompletedActivityEvent(userId, creditedXp),
        );
      }
    }

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

    const winnerTokenPriceDelta =
      priceDelta[winningFighterTicker.toLowerCase()];
    const loserTokenPriceDelta = priceDelta[losingFighter.ticker.toLowerCase()];

    // Record fight history
    await this.matchPersistenceService.recordFightHistory({
      seriesCodeName,
      matchId,
      startTime,
      winner: winningFighter,
      fighters: fightersWithBetCounts,
      winnerTokenPriceDelta,
      loserTokenPriceDelta,
    });

    this.activityStreamService.track(
      new MatchCompletedActivityEvent(
        winningFighter.displayName,
        losingFighter.displayName,
        totalWinPool,
        winnerTokenPriceDelta?.relative,
        loserTokenPriceDelta?.relative,
      ),
    );
  }
}
