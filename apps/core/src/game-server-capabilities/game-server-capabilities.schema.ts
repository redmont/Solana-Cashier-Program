import { Schema } from 'dynamoose';

export const GameServerCapabilitiesSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  headModels: {
    type: 'Set',
    schema: [String],
  },
  torsoModels: {
    type: 'Set',
    schema: [String],
  },
  legModels: {
    type: 'Set',
    schema: [String],
  },
  finishingMoves: {
    type: 'Set',
    schema: [String],
  },
  levels: {
    type: 'Set',
    schema: [String],
  },
});
