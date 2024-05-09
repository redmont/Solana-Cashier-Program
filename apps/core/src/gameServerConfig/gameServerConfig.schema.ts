import { Schema } from 'dynamoose';

export const GameServerConfigSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  streamUrl: String,
});
