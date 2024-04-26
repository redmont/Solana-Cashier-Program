import { Key } from 'src/interfaces/key';

export interface Bet extends Key {
  userId: string;
  amount: number;
  fighter: string;
}
