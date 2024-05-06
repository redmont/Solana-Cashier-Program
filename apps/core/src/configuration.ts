import 'dotenv/config';

export default () => ({
  natsUri: process.env.NATS_URI,
  redisHost: process.env.BROKER_REDIS_HOST,
  redisPort: parseInt(process.env.BROKER_REDIS_PORT, 10),
  isDynamoDbLocal: process.env.IS_DDB_LOCAL === 'true',
  tableName: process.env.TABLE_NAME,
  queryStoreTableName: process.env.QUERY_STORE_TABLE_NAME,
  gameServerWsPort: parseInt(process.env.GAME_SERVER_WS_PORT, 10),
  priceDataTableName: process.env.PRICE_DATA_TABLE_NAME,
  useMockMatchOutcomeService: process.env.USE_MOCK_MATCH_OUTCOME_SERVICE,
});
