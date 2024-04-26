import { Schema } from 'dynamoose';

export const AccountSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  balance: Number,
  primaryWalletAddress: {
    type: String,
    index: {
      name: 'primaryWalletAddress',
      type: 'global',
      project: true,
    },
  },
});
