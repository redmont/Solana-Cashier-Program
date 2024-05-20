import { Schema } from 'dynamoose';

export const MatchSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
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
