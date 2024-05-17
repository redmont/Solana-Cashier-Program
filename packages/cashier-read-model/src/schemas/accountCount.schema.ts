import { Schema } from 'dynamoose';

const AccountCountSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  count: Number,
});

export { AccountCountSchema };
