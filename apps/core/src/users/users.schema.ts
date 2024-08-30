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
  userId: String,
  ethereumWalletAddress: String,
  totalNetBetAmount: Number,
  totalNetBetAmountCreditedXp: Number,
  xp: Number,
  matchCount: Number,
  totalBetAmount: Number,
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
