import { ReactNode } from 'react';
import { z } from 'zod';

export interface ChildContainerProps {
  children: ReactNode;
}

export interface Fighter {
  displayName: string;
  codeName: string;
  ticker: string;
  imageUrl: string;
}

export interface Bet {
  amount: string;
  fighter: string;
  walletAddress: string;
}

export const MatchStatusEnum = z.enum([
  '',
  'bettingOpen',
  'pendingStart',
  'pollingPrices',
  'matchInProgress',
  'matchFinished',
]);

export type MatchStatus = z.infer<typeof MatchStatusEnum>;
