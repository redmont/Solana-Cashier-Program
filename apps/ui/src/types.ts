import { ReactNode } from 'react';

export interface ChildContainerProps {
  children: ReactNode;
}

export type Fighter = 'doge' | 'pepe';

export interface Bet {
  amount: string;
  fighter: string;
  walletAddress: string;
}
