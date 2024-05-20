import { Schema } from 'dynamoose';

export const UserMatchSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  userId: String,
  betAmount: String,
  winAmount: String,
  seriesCodeName: String,
  matchId: String,
  startTime: String,
  fighters: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          displayName: String,
          codeName: String,
          ticker: String,
          imagePath: String,
          betCount: Number,
        },
      },
    ],
  },
  winner: {
    type: Object,
    schema: {
      codeName: String,
    },
  },
});
