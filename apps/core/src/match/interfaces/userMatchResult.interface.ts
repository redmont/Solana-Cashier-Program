import { Key } from '@/interfaces/key';

export interface UserMatchResult extends Key {
  amount: number;
  createdAt: string;
}
