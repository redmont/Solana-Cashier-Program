import { MatchStatus } from '@/types';

export const matchStatusSequence: MatchStatus[] = [
  'pendingStart',
  'bettingOpen',
  'pollingPrices',
  'matchInProgress',
  'matchFinished',
];
