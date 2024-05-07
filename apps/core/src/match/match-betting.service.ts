import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchPersistenceService } from './match-persistence.service';
import { sendBrokerMessage } from 'broker-comms';
import { ClientProxy } from '@nestjs/microservices';
import { CreditMessage } from 'cashier-messages';
import { ActivityStreamService } from 'src/activity-stream/activity-stream.service';
import dayjs from '@/dayjs';
import { SeriesConfig } from '@/series/series-config.model';

@Injectable()
export class MatchBettingService {
  private readonly logger: Logger = new Logger(MatchBettingService.name);

  constructor(
    private readonly matchPersistenceService: MatchPersistenceService,
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly activityStreamService: ActivityStreamService,
  ) {}

  async getBets(matchId: string) {
    return this.matchPersistenceService.getBets(matchId);
  }

  async distributeWinnings(
    seriesCodeName: string,
    matchId: string,
    winningFighter: { displayName: string; codeName: string },
    seriesConfig: SeriesConfig,
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

    for (const userId of Object.keys(winsPerUser)) {
      const amount = winsPerUser[userId];

      // Send credit message to cashier
      await sendBrokerMessage(this.broker, new CreditMessage(userId, amount));

      await this.activityStreamService.track(
        seriesCodeName,
        matchId,
        dayjs.utc(),
        'win',
        {
          amount: amount,
          winningFighter: winningFighter?.displayName,
        },
        userId,
      );
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
    }
  }
}
