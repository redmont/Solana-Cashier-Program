import { Schema } from 'dynamoose';

export const DailyClaimAmountsSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  dailyClaimAmounts: { type: Array, required: true, schema: [Number] },
});
