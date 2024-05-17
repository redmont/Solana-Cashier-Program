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
  roster: {
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
});
