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
  preMatchVideoPath: String,
  preMatchDelay: Number,
  fighterProfiles: {
    type: Array,
    schema: [String],
  },
  level: String,
  fightType: String,
  state: String,
  context: Object,
});
