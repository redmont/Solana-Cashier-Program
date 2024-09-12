import { Injectable } from '@nestjs/common';
import { RedisCacheService } from 'global-cache';

@Injectable()
export class UsernameQueryStoreService {
  constructor(private readonly cache: RedisCacheService) {}

  async setUsername(userId: string, username: string): Promise<void> {
    const key = `username:${userId}`;
    await this.cache.set(key, username);
  }

  async getUsername(userId: string): Promise<string> {
    await this.cache.get(userId);
    const key = `username:${userId}`;

    const username = this.cache.get(key);
    return username;
  }
}
