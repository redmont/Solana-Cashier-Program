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
  tokenAddress?: string;
  tokenChainId?: string;
}

export interface Bet {
  amount: string;
  fighter: string;
  walletAddress: string;
  orderBook: OrderBook;
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

export type OrderBook = string;
export const StandardOrderBook: OrderBook = 'standard';
export const VIPOrderBook: OrderBook = 'vip';

export type Environment = 'production' | 'preview' | 'development';
