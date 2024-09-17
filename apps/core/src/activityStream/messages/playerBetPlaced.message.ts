import { Injectable } from '@nestjs/common';
import { BetPlacedActivityEvent } from '../events/betPlaced.event';
import { MessageConverter } from './messageConverter';
import { creditsToUsd } from '@/utils';

@Injectable()
export class PlayerBetPlacedMessage
  implements MessageConverter<BetPlacedActivityEvent>
{
  async convert({
    userId,
    amount,
    fighterDisplayName,
  }: BetPlacedActivityEvent) {
    const usdAmount = creditsToUsd(amount);

    const message = `**Stake confirmed:** $${usdAmount.toFixed(2)}  on ${fighterDisplayName}. 💸`;
    return { userId, message };
  }
}
