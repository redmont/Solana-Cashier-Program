import { Schema } from 'dynamoose';

export const DailyClaimStatusSchema = new Schema({
  // dailyClaimStatus
  pk: {
    type: String,
    hashKey: true,
  },
  // (userId)
  sk: {
    type: String,
    rangeKey: true,
  },
  dailyClaimStreak: { type: Number, required: true },
  nextClaimDate: { type: String, required: false },
  claimExpiryDate: { type: String, required: false },
});
