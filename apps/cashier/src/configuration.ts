import 'dotenv/config';

export default () => ({
  natsUri: process.env.NATS_URI,
  eventsTableName: process.env.EVENTS_TABLE_NAME,
  readModelTableName: process.env.READ_MODEL_TABLE_NAME,
  isDynamoDbLocal: process.env.IS_DDB_LOCAL,
  websocketPort: parseInt(process.env.WS_PORT, 10),
});
