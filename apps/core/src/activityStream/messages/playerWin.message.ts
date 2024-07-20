import { Injectable } from '@nestjs/common';
import { WinActivityEvent } from '../events';
import { pluralise } from '../utils';
import { MessageConverter } from './messageConverter';

@Injectable()
export class PlayerWinMessage implements MessageConverter<WinActivityEvent> {
  async convert(event: WinActivityEvent) {
    const { userId, amount } = event;

    const message = `**You won ${amount} ${pluralise(amount, 'credit', 'credits')}!** Check the (/tournament)[leaderboard] to see your latest rank.`;

    return { userId, message };
  }
}
