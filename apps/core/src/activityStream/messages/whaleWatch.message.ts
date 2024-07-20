import { Injectable } from '@nestjs/common';
import { BetPlacedActivityEvent } from '../events/betPlaced.event';
import { MessageConverter } from './messageConverter';
import { UserProfilesQueryStoreService } from 'query-store';

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
    if (amount < 1) {
      return null;
    }

    const usernames = await this.userProfiles.getUsernames([userId]);
    const username = usernames[userId];

    if (username?.length > 0) {
      const message = `**Whale watch!**  
🐋 ${username} just bet  
💰 ${amount} credits on  
🥊 ${fighterDisplayName} to win`;

      return { message };
    }
    return null;
  }
}
