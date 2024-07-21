import { DynamicModule, Global, Module } from '@nestjs/common';
import { RedisCacheService } from './redisCache.service';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './redisCache.module-definition';
import { RedisCacheModuleOptions } from './interfaces/redisCacheModuleOptions.interface';

@Module({})
export class RedisCacheModule extends ConfigurableModuleClass {
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      module: RedisCacheModule,
      imports: options.imports || [],
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        RedisCacheService,
      ],
      exports: [RedisCacheService],
    };
  }
}
