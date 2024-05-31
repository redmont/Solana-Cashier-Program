import { Schema } from 'dynamoose';

export const NonceSchema = new Schema({
  // streamToken#userId
  pk: {
    type: String,
    hashKey: true,
  },
  // createdAt
  sk: {
    type: String,
    rangeKey: true,
  },
  expiresAt: String,
  tokenId: String,
  token: String,
});
