import { Injectable } from '@nestjs/common';
import { MessageConverter } from './messageConverter';
import { PoolOpenActivityEvent } from '../events';
import { QueryStoreService } from 'query-store';
import { md } from '../utils';

@Injectable()
export class PoolOpenMessage
  implements MessageConverter<PoolOpenActivityEvent>
{
  constructor(private readonly queryStore: QueryStoreService) {}

  async convert({ fighter1, fighter2 }: PoolOpenActivityEvent) {
    const matchHistory = await this.queryStore.getMatchHistory([
      fighter1.codeName,
      fighter2.codeName,
    ]);
    let resultsText = '';
    if (matchHistory.length > 0) {
      const winners = matchHistory.slice(0, 5).map((m) => m.winner);

      const winnerDisplayNames = winners.map((winner) => {
        if (winner.codeName === fighter1.codeName) {
          return fighter1.displayName;
        } else {
          return fighter2.displayName;
        }
      });

      // prettier-ignore
      resultsText = md`\n\n**Last 5 results: 🏆**\n${winnerDisplayNames.join(md`\n`)}`;
    }

    let message = `**The match pool is OPEN:** place your stakes now for ${fighter1.displayName} vs ${fighter2.displayName}! 🥊`;

    return {
      message: `${message}${resultsText}`,
    };
  }
}
