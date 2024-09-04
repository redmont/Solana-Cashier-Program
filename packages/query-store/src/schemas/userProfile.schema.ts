import { Schema } from 'dynamoose';
import { KeySchema } from 'src/schemas/key.schema';

export const UserProfileSchema = new Schema({
  ...KeySchema,
  username: {
    type: String,
    required: true,
  },
  primaryWalletAddress: {
    type: String,
    required: true,
  },
  xp: Number,
});
