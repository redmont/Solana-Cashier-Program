import { ConfigurableModuleBuilder } from '@nestjs/common';
import { QueryStoreModuleOptions } from './interfaces/queryStoreModuleOptions.interface';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: QUERY_STORE_MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE: QUERY_STORE_MODULE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: QUERY_STORE_MODULE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<QueryStoreModuleOptions>({
  moduleName: 'QueryStoreModule',
}).build();
