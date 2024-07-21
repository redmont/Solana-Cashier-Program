import { Schema } from 'dynamoose';

export const DailyClaimAmountsSchema = new Schema({
  // dailyClaimAmounts
  pk: {
    type: String,
    hashKey: true,
  },
  // dailyClaimAmounts
  sk: {
    type: String,
    rangeKey: true,
  },
  dailyClaimAmounts: { type: Array, required: true, schema: [Number] },
});
