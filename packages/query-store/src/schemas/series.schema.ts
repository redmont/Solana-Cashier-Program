import { Schema } from 'dynamoose';

export const SeriesSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  state: String,
  startTime: {
    type: String,
    required: false,
  },
  bets: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          walletAddress: { type: String, required: true },
          amount: { type: String, required: true },
          fighter: { type: String, required: true },
        },
      },
    ],
  },
});
