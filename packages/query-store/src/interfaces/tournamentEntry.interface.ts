import { Key } from './key.interface';

export interface TournamentEntry extends Key {
  primaryWalletAddress: string;
  winAmount: number;
  balance: string;
}
