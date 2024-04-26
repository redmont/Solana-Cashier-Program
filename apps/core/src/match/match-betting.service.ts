import { Inject, Injectable, Logger } from '@nestjs/common';
import { MatchPersistenceService } from './match-persistence.service';
import { sendBrokerMessage } from 'broker-comms';
import { ClientProxy } from '@nestjs/microservices';
import { CreditMessage } from 'cashier-messages';
import { QueryStoreService } from 'query-store';
import { ActivityStreamService } from 'src/activity-stream/activity-stream.service';
import { DateTime } from 'luxon';

@Injectable()
export class MatchBettingService {
  private readonly logger: Logger = new Logger(MatchBettingService.name);

  constructor(
    private readonly matchPersistenceService: MatchPersistenceService,
    @Inject('BROKER') private readonly broker: ClientProxy,
    private readonly activityStreamService: ActivityStreamService,
  ) {}

  async distributeWinnings(
    seriesCodeName: string,
    matchId: string,
    winningFighter: { displayName: string; codeName: string },
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

    this.logger.log(`Win pool is: '${totalWinPool}'`);

    const wins = [];

    // Calculate win amount for each bet
    for (const bet of bets.filter(
      (bet) => bet.fighter === winningFighter?.codeName,
    )) {
      const poolWinnings =
        totalWinPool > 0 ? (bet.amount / totalWinPool) * totalWinPool : 0;
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
        DateTime.utc(),
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
        DateTime.utc(),
        'loss',
        {
          winningFighter: winningFighter?.displayName,
        },
        loserUserId,
      );
    }
  }
}
