import { Injectable } from '@nestjs/common';
import { MatchCompletedActivityEvent } from '../events/matchCompleted.event';
import { MessageConverter } from './messageConverter';
import { md, signedNumberFormat } from '../utils';
import { creditsToUsd } from '@/utils';

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
    const prizePoolFormatted = Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(creditsToUsd(prizePool));

    if (!winnerPriceChange || !loserPriceChange) {
      return {
        message: md`${winnerDisplayName} beats ${loserDisplayName} for the win! 🥊\n\nTotal prize pool won is ${prizePoolFormatted} 🏦`,
      };
    }

    return {
      message: md`${winnerDisplayName} ${signedNumberFormat.format(winnerPriceChange)}% beats ${loserDisplayName} ${signedNumberFormat.format(loserPriceChange)}% for the win! 🥊\n\nTotal prize pool won is $${prizePoolFormatted} 🏦`,
    };
  }
}
