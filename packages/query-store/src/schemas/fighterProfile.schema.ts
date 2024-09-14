import { Schema } from 'dynamoose';
import { KeySchema } from 'src/schemas/key.schema';

export const FighterProfileSchema = new Schema({
  ...KeySchema,
  codeName: String,
  displayName: String,
  imagePath: String,
  fightCount: Number,
  winningFightCount: Number,
  wageredSum: Number,
  showOnRoster: Boolean,
});
