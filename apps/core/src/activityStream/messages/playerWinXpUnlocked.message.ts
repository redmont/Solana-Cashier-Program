import { Injectable } from '@nestjs/common';
import { MessageConverter } from './messageConverter';
import { WinActivityEvent } from '../events';
import { WinXpActivityEvent } from '../events/winXpActivity.event';

@Injectable()
export class PlayerWinXpUnlockedMessage
  implements MessageConverter<WinXpActivityEvent>
{
  async convert(event: WinXpActivityEvent) {
    const { userId, amount } = event;

    const message = `**XP unlocked!** You've earned ${amount} more XP from this fight. Check out your new tournament rank. 🥊`;

    return { userId, message };
  }
}
