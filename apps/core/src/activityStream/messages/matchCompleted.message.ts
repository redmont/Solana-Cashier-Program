import { Injectable } from '@nestjs/common';
import { MatchCompletedActivityEvent } from '../events/matchCompleted.event';
import { MessageConverter } from './messageConverter';

@Injectable()
export class MatchCompletedMessage
  implements MessageConverter<MatchCompletedActivityEvent>
{
  async convert({
    winnerDisplayName,
    winnerPriceChange,
    loserDisplayName,
    loserPriceChange,
    prizePool,
  }: MatchCompletedActivityEvent) {
    const prizePoolFormatted = Intl.NumberFormat('en-US').format(
      Math.round(prizePool),
    );

    if (!winnerPriceChange || !loserPriceChange) {
      return {
        message: `${winnerDisplayName} beats ${loserDisplayName} for the win! 🥊  
  
Total prize pool won is ${prizePoolFormatted} 🏦`,
      };
    }

    return {
      message: `${winnerDisplayName} ${Math.sign(winnerPriceChange)}% beats ${loserDisplayName} ${Math.sign(loserPriceChange)}% for the win! 🥊  
  
Total prize pool won is ${prizePoolFormatted} 🏦`,
    };
  }
}
