export interface QueryStoreModuleOptions {
  local?: string | boolean;
  tableName: string;
  isDynamoDbLocal: boolean;
  redisHost: string;
  redisPort: number;
}
