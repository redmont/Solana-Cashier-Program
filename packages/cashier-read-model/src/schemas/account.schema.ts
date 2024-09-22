import { Schema } from 'dynamoose';

const AccountSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
    index: {
      name: 'pkBalance',
      type: 'global',
      project: true,
      rangeKey: 'balance',
    },
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  balance: Number,
  vipBalance: Number,
  primaryWalletAddress: {
    type: String,
    index: {
      name: 'primaryWalletAddress',
      type: 'global',
      project: true,
    },
  },
  lastUpdated: String,
});

export { AccountSchema };
