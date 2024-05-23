import { Schema } from 'dynamoose';

export const TournamentEntrySchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
    index: {
      name: 'pkWinAmount',
      rangeKey: 'winAmount',
      type: 'global',
      project: ['sk', 'primaryWalletAddress', 'winAmount', 'balance'],
    },
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  primaryWalletAddress: String,
  winAmount: Number,
  balance: String,
});
