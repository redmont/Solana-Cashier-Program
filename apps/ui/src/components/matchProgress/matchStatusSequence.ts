import { MatchStatus } from '@/types';

export const matchStatusSequence: MatchStatus[] = [
  MatchStatus.PendingStart,
  MatchStatus.BetsOpen,
  MatchStatus.PollingPrices,
  MatchStatus.InProgress,
  MatchStatus.Finished,
];
