import { ReactNode } from 'react';

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

export enum MatchStatus {
  Unknown = '',
  BetsOpen = 'bettingOpen',
  PendingStart = 'pendingStart',
  PollingPrices = 'pollingPrices',
  InProgress = 'matchInProgress',
  Finished = 'matchFinished',
}
