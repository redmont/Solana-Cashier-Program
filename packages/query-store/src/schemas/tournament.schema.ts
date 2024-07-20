import { Schema } from 'dynamoose';

export const TournamentSchema = new Schema({
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
        'currentRound',
        'prizes',
      ],
    },
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  displayName: String,
  description: String,
  startDate: String,
  endDate: String,
  currentRound: Number,
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
});
