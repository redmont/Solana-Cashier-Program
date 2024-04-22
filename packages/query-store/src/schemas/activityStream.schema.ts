import { Schema } from 'dynamoose';

export const ActivityStreamSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  message: String,
});
