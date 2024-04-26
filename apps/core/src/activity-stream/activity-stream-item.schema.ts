import { Schema } from 'dynamoose';

export const ActivityStreamItemSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },
    sk: {
      type: String,
      rangeKey: true,
    },
    activity: String,
    data: Object,
  },
  {
    saveUnknown: ['data.*'],
  },
);
