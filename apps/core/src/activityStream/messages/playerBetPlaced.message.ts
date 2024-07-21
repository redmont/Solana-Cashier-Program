import { Injectable } from '@nestjs/common';
import { BetPlacedActivityEvent } from '../events/betPlaced.event';
import { pluralise } from '../utils';
import { MessageConverter } from './messageConverter';

@Injectable()
export class PlayerBetPlacedMessage
  implements MessageConverter<BetPlacedActivityEvent>
{
  async convert({
    userId,
    amount,
    fighterDisplayName,
  }: BetPlacedActivityEvent) {
    const message = `**Stake confirmed:** ${amount} ${pluralise(amount, 'credit', 'credits')} on ${fighterDisplayName}. 💸`;
    return { userId, message };
  }
}
