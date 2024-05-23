import { Schema } from 'dynamoose';

export const TournamentSchema = new Schema({
  // String 'tournament'
  pk: {
    type: String,
    hashKey: true,
    index: {
      name: 'pkStartDate',
      rangeKey: 'startDate',
      type: 'global',
      project: [
        'sk',
        'displayName',
        'description',
        'startDate',
        'endDate',
        'prizes',
      ],
    },
  },
  // Code name
  sk: {
    type: String,
    rangeKey: true,
  },
  displayName: String,
  description: String,
  startDate: String,
  endDate: String,
  prizes: {
    type: Array,
    schema: [
      {
        type: Object,
        schema: {
          title: String,
          description: String,
        },
      },
    ],
  },
  createdAt: String,
  updatedAt: String,
});
