import { Injectable } from '@nestjs/common';
import { MessageConverter } from './messageConverter';
import { BetXpActivityEvent } from '../events';

@Injectable()
export class PlayerXpUnlockedMessage
  implements MessageConverter<BetXpActivityEvent>
{
  async convert(event: BetXpActivityEvent) {
    const { userId, amount } = event;

    const message = `**XP unlocked!** You've earned ${amount} more XP from this fight. Check out your new tournament rank. 🥊`;

    return { userId, message };
  }
}
