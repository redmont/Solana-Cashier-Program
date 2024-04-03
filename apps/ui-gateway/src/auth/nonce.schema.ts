import { Schema } from "dynamoose";

export const NonceSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  timestamp: {
    type: String,
  },
});
