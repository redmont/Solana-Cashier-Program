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
  displayName: {
    type: String,
  },
  state: {
    type: String,
  },
  context: {
    type: Object,
  },
});
