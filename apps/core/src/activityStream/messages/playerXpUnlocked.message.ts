import { Injectable } from '@nestjs/common';
import { MessageConverter } from './messageConverter';
import { PlayerMatchCompletedActivityEvent } from '../events';

@Injectable()
export class PlayerXpUnlockedMessage
  implements MessageConverter<PlayerMatchCompletedActivityEvent>
{
  async convert(event: PlayerMatchCompletedActivityEvent) {
    const { userId, xp } = event;

    if (xp === 0) {
      return null;
    }

    const message = `**XP unlocked!** You've earned ${xp} more XP from this fight. Check out your new tournament rank. 🥊`;

    return { userId, message };
  }
}
