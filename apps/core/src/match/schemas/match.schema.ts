import { Schema } from 'dynamoose';
import { DateTime } from 'luxon';

export const MatchSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  seriesCodeName: {
    type: String,
  },
  state: {
    type: String,
  },
  startTime: {
    type: String,
    required: false,
  },
  context: {
    type: Object,
  },
});
