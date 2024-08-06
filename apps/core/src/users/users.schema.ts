import { Schema } from 'dynamoose';

export const UserSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
    index: {
      name: 'skUserId',
      type: 'global',
      project: false,
      rangeKey: 'userId',
    },
  },
  userId: {
    type: String,
  },
  ethereumWalletAddress: {
    type: String,
  },
});

export const UserWalletSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
});
