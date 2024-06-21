import { Controller } from '@nestjs/common';
import { NatsJetStreamContext } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { TournamentService } from './tournament.service';
import { AccountCreditedEvent } from 'cashier-messages';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class TournamentController {
  constructor(private readonly service: TournamentService) {}

  @EventPattern(AccountCreditedEvent.messageType)
  async handleAccountCredited(
    @Ctx() ctx: NatsJetStreamContext,
    @Payload() data: AccountCreditedEvent,
  ) {
    if (data.reason !== 'WIN') {
      ctx.message.ack();
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

    ctx.message.ack();
  }
}
