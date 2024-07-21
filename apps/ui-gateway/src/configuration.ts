import 'dotenv/config';
import { createHash, randomBytes } from 'crypto';

const generateInstanceId = () => {
  return createHash('sha256').update(randomBytes(32)).digest('hex').slice(0, 8);
};

const instanceId = generateInstanceId();

export default () => ({
  instanceId,
  natsUri: process.env.NATS_URI,
  redisHost: process.env.REDIS_HOST,
  redisPort: parseInt(process.env.REDIS_PORT, 10),
  corsOrigins: process.env.CORS_ORIGINS?.split(',') ?? ['*'],
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3333', 10),
  nonceTtl: parseInt(process.env.NONCE_TTL, 10) || 10 * 60 * 1000, // 10 minutes
  tableName: process.env.TABLE_NAME,
  queryStoreTableName: process.env.QUERY_STORE_TABLE_NAME,
  cashierReadModelTableName: process.env.CASHIER_READ_MODEL_TABLE_NAME,
  isDynamoDbLocal: process.env.IS_DDB_LOCAL === 'true',
  mediaUri: process.env.MEDIA_URI,
  dynamicPublicKey: process.env.DYNAMIC_PUBLIC_KEY,
  millicastApiSecret: process.env.MILLICAST_API_SECRET,
  millicastStreamName: process.env.MILLICAST_STREAM_NAME,
  millicastParentSubscribeToken: process.env.MILLICAST_PARENT_SUBSCRIBE_TOKEN,
  millicastParentSubscribeTokenId:
    process.env.MILLICAST_PARENT_SUBSCRIBE_TOKEN_ID,
  millicastAllowedOrigins: process.env.MILLICAST_ALLOWED_ORIGINS,
  streamAuthParentTokenId: process.env.STREAM_AUTH_PARENT_TOKEN_ID,
  streamAuthParentTokenSecret: process.env.STREAM_AUTH_PARENT_TOKEN_SECRET,
  pubNubPublishKey: process.env.PUBNUB_PUBLISH_KEY,
  pubNubSubscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  pubNubSecretKey: process.env.PUBNUB_SECRET_KEY,
  pubNubUserId: process.env.PUBNUB_USER_ID,
});
