import { Key } from './key.interface';

export interface TournamentEntry extends Key {
  primaryWalletAddress: string;
  tournamentEntryWinAmount: number;
  balance: string;
}
