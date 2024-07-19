import { Injectable } from '@nestjs/common';
import { RedisCacheService } from 'global-cache';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from 'src/interfaces/key.interface';
import { UserProfile } from './interfaces/userProfile.interface';

@Injectable()
export class UserProfilesQueryStoreService {
  constructor(
    private readonly cache: RedisCacheService,
    @InjectModel('userProfile')
    private readonly userProfileModel: Model<UserProfile, Key>,
  ) {
  }

  async setUserProfile(
    userId: string,
    profile: { username: string },
  ): Promise<void> {
    const key = `userProfile:${userId}`;

    await this.cache.hmset(key, profile);

    await this.userProfileModel.update({
      pk: 'userProfile',
      sk: userId,
      ...profile,
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    const key = `userProfile:${userId}`;

    return await this.cache.get(key);
  }

  async getUsernames(userIds: string[]) {
    const keys = userIds.map((userId) => `userProfile:${userId}`);
    const usernames = await this.cache.hmgetBatch(keys, ['username']);

    return userIds.reduce((acc, userId, index) => {
      acc[userId] = usernames[index][1][0];
      return acc;
    }, {});
  }
}
