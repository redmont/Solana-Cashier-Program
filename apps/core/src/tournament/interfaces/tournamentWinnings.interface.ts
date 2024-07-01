import { Key } from '@/interfaces/key';

export interface TournamentWinnings extends Key {
  tournament: string;
  userId: string;
  primaryWalletAddress: string;
  winAmount: number;
  createdAt: string;
}
