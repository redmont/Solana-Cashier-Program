import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { MODULE_OPTIONS_TOKEN } from './redisCache.module-definition';
import { RedisCacheModuleOptions } from './interfaces/redisCacheModuleOptions.interface';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) readonly options: RedisCacheModuleOptions,
  ) {
    this.client = new Redis({
      host: options.redisHost,
      port: options.redisPort,
    });
  }

  onModuleInit() {
    this.client.on('connect', () => console.log('Connected to Redis'));
    this.client.on('error', (error) => console.error('Redis error', error));
  }

  onModuleDestroy() {
    this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async hmset(key: string, value: any): Promise<void> {
    await this.client.hmset(key, value);
  }

  async sadd(setKey: string, value: string) {
    await this.client.sadd(setKey, value);
  }

  async hmgetBatch(keys: string[], fields: string[]): Promise<any[]> {
    const pipeline = this.client.pipeline();
    keys.forEach((key) => pipeline.hmget(key, ...fields));

    return await pipeline.exec();
  }

  async getAllItems(prefix: string): Promise<any[]> {
    // Retrieve all IDs for the given prefix
    const itemIds = await this.client.smembers(`${prefix}:list`);
    if (itemIds.length === 0) {
      return [];
    }

    // Use pipelining to retrieve all items by their IDs in a single round trip
    const pipeline = this.client.pipeline();
    itemIds.forEach((id) => pipeline.get(`${prefix}:${id}`));
    const results = await pipeline.exec();

    // Parse the results, safely handling JSON parsing
    return results
      .map(([err, result]) => {
        try {
          return JSON.parse(result as string);
        } catch (error) {
          console.error('Error parsing item from Redis:', error);
          return null;
        }
      })
      .filter((item) => item !== null); // Filter out any nulls from parse failures
  }
}
