import { Schema, type } from 'dynamoose';

export const CurrentMatchSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  state: String,
  seriesCodeName: String,
  matchId: {
    type: String,
    required: false,
  },
  preMatchVideoPath: {
    type: String,
    required: false,
  },
  streamId: {
    type: String,
    required: false,
  },
  poolOpenStartTime: {
    type: String,
    required: false,
  },
  startTime: {
    type: String,
    required: false,
  },
  winner: {
    type: String,
    required: false,
  },
  fighters: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          codeName: { type: String, required: true },
          displayName: { type: String, required: true },
          ticker: { type: String, required: true },
          imagePath: { type: String, required: true },
          tokenAddress: String,
          tokenChainId: String,
        },
      },
    ],
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
          orderBook: { type: String, required: true },
        },
      },
    ],
  },
  lastUpdated: String,
});
