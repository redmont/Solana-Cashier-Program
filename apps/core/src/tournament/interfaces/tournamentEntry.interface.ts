import { Key } from '@/interfaces/key';

export interface TournamentEntry extends Key {
  tournament: string;
  userId: string;
  primaryWalletAddress: string;
  winAmount: number;
  balance: string;
  updatedAt: string;
}
