import { Schema } from 'dynamoose';

const BetSchema = new Schema({
  walletAddress: {
    type: String,
  },
  amount: {
    type: String,
  },
});

export const MatchSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  state: String,
  bets: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          walletAddress: { type: String, required: true },
          amount: { type: String, required: true },
        },
      },
    ],
  },
});
