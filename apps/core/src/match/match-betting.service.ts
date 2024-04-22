import { Inject, Injectable } from '@nestjs/common';
import { MatchPersistenceService } from './match-persistence.service';
import { sendBrokerMessage } from 'broker-comms';
import { ClientProxy } from '@nestjs/microservices';
import { CreditMessage } from 'cashier-messages';

@Injectable()
export class MatchBettingService {
  constructor(
    private readonly matchPersistenceService: MatchPersistenceService,
    @Inject('BROKER') private readonly broker: ClientProxy,
  ) {}

  async distributeWinnings(matchId: string, winningFighter: string) {
    console.log('Distributing winnings, winning fighter is', winningFighter);
    const bets = await this.matchPersistenceService.getBets(matchId);

    // Winnings come from the total amount bet on the losing fighter
    const totalWinPool =
      bets
        .filter((bet) => bet.fighter !== winningFighter)
        .reduce((acc, bet) => acc + bet.amount, 0) * 0.95;

    console.log('Win pool is', totalWinPool);

    // Calculate win amount for each bet
    for (const bet of bets.filter((bet) => bet.fighter === winningFighter)) {
      const poolWinnings =
        totalWinPool > 0 ? (bet.amount / totalWinPool) * totalWinPool : 0;
      const winAmount = bet.amount + poolWinnings;

      if (winAmount > 0) {
        console.log('Sending credit message to cashier', bet.userId, winAmount);
        // Send credit message to cashier
        await sendBrokerMessage(
          this.broker,
          new CreditMessage(bet.userId, winAmount),
        );
      }
    }
  }
}
