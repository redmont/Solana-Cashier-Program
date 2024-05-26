import { Controller } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { AccountCreditedEvent } from 'cashier-messages';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class TournamentController {
  constructor(private readonly service: TournamentService) {}

  @EventPattern(AccountCreditedEvent.messageType)
  async handleAccountCredited(data: AccountCreditedEvent) {
    if (data.reason !== 'WIN') {
      return;
    }

    const currentTournamentCodeName = await this.service.getTournamentCodeName(
      data.timestamp,
    );

    if (currentTournamentCodeName) {
      await this.service.updateTournamentEntry({
        timestamp: data.timestamp,
        tournament: currentTournamentCodeName,
        userId: data.userId,
        primaryWalletAddress: data.primaryWalletAddress,
        winAmount: parseInt(data.amount),
        balance: data.balance,
      });
    }
  }
}
