export interface LeaderboardProps {
  records: LeaderboardRecord[];
}

export interface LeaderboardWidgetProps extends LeaderboardProps {
  searchQuery?: string;
  endDateTime: string | number;
  startDateTime: string | number;
  currentRound: number;
  roundEndDate: string | number;
  onSearch?: (query: string) => void;
}

export interface LeaderboardRecord {
  username?: string;
  walletAddress: string;
  xp?: string;
  rank: number;
  highlighted?: boolean;
  winAmount?: string;
}
