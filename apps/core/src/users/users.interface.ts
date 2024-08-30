import { Key } from 'src/interfaces/key';

export interface User extends Key {
  userId: string;
  ethereumWalletAddress: string;
  matchCount: number;
  totalNetBetAmount: number;
  totalNetBetAmountCreditedXp: number;
  xp: Number;
  totalBetAmount: number;
}

export interface UserWallet extends Key {}
