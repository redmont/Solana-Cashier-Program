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
  matchFighters: {
    type: String,
    required: false,
    index: {
      name: 'matchFightersStartTime',
      rangeKey: 'startTime',
      type: 'global',
      project: ['seriesCodeName', 'fighters', 'winner'],
    },
  },
  winner: {
    type: Object,
    schema: {
      codeName: String,
    },
  },
});
