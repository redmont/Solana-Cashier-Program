import 'dotenv/config';
import { createHash, randomBytes } from 'crypto';

const generateInstanceId = () => {
  return createHash('sha256').update(randomBytes(32)).digest('hex').slice(0, 8);
};

const instanceId = `gateway-${generateInstanceId()}`;

export default () => ({
  instanceId,
  natsUri: process.env.NATS_URI,
  redisHost: process.env.REDIS_HOST,
  redisPort: parseInt(process.env.REDIS_PORT, 10),
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3333', 10),
  nonceTtl: parseInt(process.env.NONCE_TTL, 10) || 10 * 60 * 1000, // 10 minutes
  tableName: process.env.TABLE_NAME,
  queryStoreTableName: process.env.QUERY_STORE_TABLE_NAME,
  cashierReadModelTableName: process.env.CASHIER_READ_MODEL_TABLE_NAME,
  isDynamoDbLocal: process.env.IS_DDB_LOCAL === 'true',
  mediaUri: process.env.MEDIA_URI,
  dynamicPublicKey: process.env.DYNAMIC_PUBLIC_KEY,
});
