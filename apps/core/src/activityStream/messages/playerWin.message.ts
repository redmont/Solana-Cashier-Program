import { Injectable } from '@nestjs/common';
import { WinActivityEvent } from '../events';
import { MessageConverter } from './messageConverter';
import { creditsToUsd } from '@/utils';

@Injectable()
export class PlayerWinMessage implements MessageConverter<WinActivityEvent> {
  async convert(event: WinActivityEvent) {
    const { userId, amount } = event;
    const usdAmount = creditsToUsd(amount);

    const message = `**You won $${usdAmount}!** Check the [leaderboard](/tournament) to see your latest rank.`;

    return { userId, message };
  }
}
