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
      // We only track the balance,
      // as the win amount is tracked elsewhere
      // (we need the net win amount).
      await this.service.updateTournamentEntry({
        timestamp: data.timestamp,
        tournament: currentTournamentCodeName,
        userId: data.userId,
        primaryWalletAddress: data.primaryWalletAddress,
        balance: data.balance,
      });
    }
  }
}
