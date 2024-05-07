import { Key } from 'src/interfaces/key';

export interface User extends Key {
  userId: string;
  ethereumWalletAddress: string;
}

export interface UserWallet extends Key {}
