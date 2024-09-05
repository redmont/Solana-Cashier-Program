import { Injectable } from '@nestjs/common';
import { RedisCacheService } from 'global-cache';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Key } from 'src/interfaces/key.interface';
import { UserProfile as UserProfileModel } from './interfaces/userProfile.interface';

interface UserProfile {
  username: string;
  primaryWalletAddress: string;
  xp: number;
}

@Injectable()
export class UserProfilesQueryStoreService {
  constructor(
    private readonly cache: RedisCacheService,
    @InjectModel('userProfile')
    private readonly userProfileModel: Model<UserProfileModel, Key>,
  ) {}

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    const set = {};

    for (const [key, value] of Object.entries(profile)) {
      set[key] = value;
    }

    const updatedProfile = await this.userProfileModel.update(
      {
        pk: 'userProfile',
        sk: userId,
      },
      {
        $SET: set,
      },
      {
        return: 'item',
        returnValues: 'ALL_NEW',
      },
    );

    await this.setUserProfileCache(userId, updatedProfile);
  }

  async setUserProfileCache(
    userId: string,
    profile: UserProfile,
  ): Promise<void> {
    const { username, primaryWalletAddress, xp } = profile;

    const key = `userProfile:${userId}`;
    const sortedKeySet = 'usernames';

    await this.cache.hset(key, { username, primaryWalletAddress, xp });
    if (username?.length > 0) {
      await this.cache.zadd(sortedKeySet, 0, `${username}:${userId}`);
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    const key = `userProfile:${userId}`;

    let userProfile: UserProfile = null;

    const data = await this.cache.hgetall(key);
    if (data) {
      const xp = data['xp'].length > 0 ? parseInt(data['xp']) : 0;

      userProfile = {
        username: data['username'],
        primaryWalletAddress: data['primaryWalletAddress'],
        xp,
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
