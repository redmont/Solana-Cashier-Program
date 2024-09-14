import { Schema } from 'dynamoose';

export const FighterProfileSchema = new Schema({
  pk: {
    type: String,
    hashKey: true,
  },
  sk: {
    type: String,
    rangeKey: true,
  },
  codeName: { type: String, required: true },
  displayName: { type: String, required: true },
  ticker: { type: String, required: true },
  tokenAddress: String,
  tokenChainId: String,
  imagePath: { type: String, required: true },
  model: {
    type: Object,
    schema: {
      head: { type: String, required: true },
      torso: { type: String, required: false },
      legs: { type: String, required: false },
    },
  },
  enabled: {
    type: Boolean,
    required: true,
  },
  showOnRoster: Boolean,
  fightCount: Number,
  winningFightCount: Number,
  wageredSum: Number,
});
