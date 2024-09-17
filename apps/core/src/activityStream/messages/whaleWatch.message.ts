import { Injectable } from '@nestjs/common';
import { BetPlacedActivityEvent } from '../events/betPlaced.event';
import { MessageConverter } from './messageConverter';
import { UserProfilesQueryStoreService } from 'query-store';
import { md } from '../utils';
import { creditsToUsd } from '@/utils';

@Injectable()
export class WhaleWatchMessage
  implements MessageConverter<BetPlacedActivityEvent>
{
  constructor(private readonly userProfiles: UserProfilesQueryStoreService) {}

  async convert({
    userId,
    amount,
    fighterDisplayName,
  }: BetPlacedActivityEvent) {
    const usdAmount = creditsToUsd(amount);
    if (usdAmount < 1000) {
      return null;
    }

    const usernames = await this.userProfiles.getUsernames([userId]);
    const username = usernames[userId];

    if (username?.length > 0) {
      const message = md`**Whale watch!**\n
🐋 ${username} just bet\n
💰 $${usdAmount.toFixed(2)} on\n
🥊 ${fighterDisplayName} to win`;

      return { message };
    }
    return null;
  }
}
