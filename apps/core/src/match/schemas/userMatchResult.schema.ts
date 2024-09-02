import { Schema } from 'dynamoose';

export const UserMatchResultSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  createdAt: String,
  amount: Number,
  xp: Number,
});
