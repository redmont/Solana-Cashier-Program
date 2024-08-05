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
  ) {}

  async setUserProfile(
    userId: string,
    profile: { username: string; primaryWalletAddress: string },
  ): Promise<void> {
    const key = `userProfile:${userId}`;
    const sortedKeySet = 'usernames';

    await this.cache.hset(key, profile);
    if (profile.username?.length > 0) {
      await this.cache.zadd(sortedKeySet, 0, `${profile.username}:${userId}`);
    }

    await this.userProfileModel.update({
      pk: 'userProfile',
      sk: userId,
      ...profile,
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    const key = `userProfile:${userId}`;

    let userProfile: {
      username: string;
      primaryWalletAddress: string;
    } | null = null;

    const data = await this.cache.hgetall(key);
    if (data) {
      userProfile = {
        username: data['username'],
        primaryWalletAddress: data['primaryWalletAddress'],
      };
    }

    return userProfile;
  }

  async getUserIdsByPartialUsername(
    partialUsername: string,
  ): Promise<string[]> {
    const sortedSetKey = 'usernames';
    const rangeStart = partialUsername;
    const rangeEnd = partialUsername + '\xff'; // To include all characters following the prefix
    const userIds = [];

    const rangeResults = await this.cache.zrangebylex(
      sortedSetKey,
      `[${rangeStart}`,
      `[${rangeEnd}`,
    );

    for (const result of rangeResults) {
      const [, userId] = result.split(':');
      userIds.push(userId);
    }

    return userIds;
  }

  async getUsernames(userIds: string[]) {
    const keys = userIds.map((userId) => `userProfile:${userId}`);
    const usernames = await this.cache.hmgetBatch(keys, ['username']);

    return userIds.reduce((acc, userId, index) => {
      acc[userId] = usernames[index][1][0];
      return acc;
    }, {});
  }

  async getUserIdentifiers(userIds: string[]): Promise<{
    [userId: string]: {
      username: string;
      primaryWalletAddress: string;
    };
  }> {
    const keys = userIds.map((userId) => `userProfile:${userId}`);
    const identifiers = await this.cache.hmgetBatch(keys, [
      'username',
      'primaryWalletAddress',
    ]);

    return userIds.reduce((acc, userId, index) => {
      let username = identifiers[index][1][0];
      acc[userId] = {
        username: username?.length > 0 ? username : null,
        primaryWalletAddress: identifiers[index][1][1],
      };
      return acc;
    }, {});
  }
}
