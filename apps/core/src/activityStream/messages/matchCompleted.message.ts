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
    return {
      message: `${winnerDisplayName} ${Math.sign(winnerPriceChange)}% beats ${loserDisplayName} ${Math.sign(loserPriceChange)}% for the win! 🥊  
  
Total prize pool won is ${prizePool} 🏦`,
    };
  }
}
