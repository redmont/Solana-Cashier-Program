import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';
import { RedisCacheService } from './redisCache.service';
import { RedisOptions } from 'ioredis';

export interface RedisCacheModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<RedisCacheOptionsFactory>;
  useClass?: Type<RedisCacheOptionsFactory>;
  useFactory?: (...args: any[]) => RedisOptions | Promise<RedisOptions>;
  inject?: any[];
  extraProviders?: Provider[];
}

export interface RedisCacheOptionsFactory {
  createRedisCacheOptions(): RedisOptions | Promise<RedisOptions>;
}

@Global()
@Module({})
export class RedisCacheModule {
  static register(options: RedisOptions): DynamicModule {
    return {
      module: RedisCacheModule,
      providers: [
        {
          provide: 'REDIS_OPTIONS',
          useValue: options,
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService],
    };
  }
  static registerAsync(options: RedisCacheModuleAsyncOptions): DynamicModule {
    return {
      module: RedisCacheModule,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), RedisCacheService],
      exports: [RedisCacheService],
    };
  }

  private static createAsyncProviders(
    options: RedisCacheModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    // For useClass
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: RedisCacheModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: 'REDIS_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // For useClass or useExisting
    return {
      provide: 'REDIS_OPTIONS',
      useFactory: async (optionsFactory: RedisCacheOptionsFactory) =>
        optionsFactory.createRedisCacheOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
