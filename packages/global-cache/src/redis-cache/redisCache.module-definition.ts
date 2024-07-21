import { ConfigurableModuleBuilder } from '@nestjs/common';
import { RedisCacheModuleOptions } from './interfaces/redisCacheModuleOptions.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<RedisCacheModuleOptions>().build();
