import { Schema } from 'dynamoose';

export const RosterSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  scheduleType: String,
  series: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          codeName: { type: String, required: true },
        },
      },
    ],
  },
  schedule: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          codeName: { type: String, required: true },
        },
      },
    ],
  },
  timedSeries: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          codeName: { type: String, required: true },
          startTime: { type: String, required: true },
        },
      },
    ],
  },
});
