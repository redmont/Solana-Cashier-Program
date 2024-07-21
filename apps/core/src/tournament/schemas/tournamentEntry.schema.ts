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
  entryBetAmount: Number,
  entryBetAmountCreditedXp: Number,
  balance: String,
  xp: Number,
  updatedAt: String,
});
