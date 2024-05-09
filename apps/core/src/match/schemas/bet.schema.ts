import { Schema } from 'dynamoose';

export const BetSchema = new Schema({
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
  userId: String,
  fighter: String,
});
