export type MatchState =
  | 'pendingStart'
  | 'bettingOpen'
  | 'pollingPrices'
  | 'matchInProgress'
  | 'matchFinished';
