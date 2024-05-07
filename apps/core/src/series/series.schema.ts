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
  displayName: String,
  betPlacementTime: Number,
  fighters: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          codeName: { type: String, required: true },
          displayName: { type: String, required: true },
          ticker: { type: String, required: true },
          model: {
            type: Object,
            schema: {
              head: { type: String, required: true },
              torso: { type: String, required: true },
              legs: { type: String, required: true },
            },
          },
        },
      },
    ],
  },
  level: String,
  state: String,
  context: Object,
});
