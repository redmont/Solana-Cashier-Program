import { Schema } from 'dynamoose';

export const TournamentEntrySchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  tournament: String,
  userId: String,
  primaryWalletAddress: String,
  winAmount: Number,
  balance: String,
  updatedAt: String,
});
