import { Key } from 'src/interfaces/key.interface';

export interface UserProfile extends Key {
  username: string;
  primaryWalletAddress: string;
  xp: number;
  team: string;
}
