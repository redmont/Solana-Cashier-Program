import { Schema } from 'dynamoose';

export const TournamentWinningsSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
    index: {
      name: 'pkCreatedAt',
      rangeKey: 'createdAt',
      type: 'global',
      project: ['sk', 'userId'],
    },
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  tournament: String,
  userId: String,
  primaryWalletAddress: String,
  winAmount: Number,
  createdAt: String,
});
