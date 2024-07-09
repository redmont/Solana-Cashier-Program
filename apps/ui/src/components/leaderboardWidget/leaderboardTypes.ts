export interface LeaderboardProps {
  records: LeaderboardRecord[];
}

export interface LeaderboardWidgetProps extends LeaderboardProps {
  searchQuery?: string;
  resetDateTime: string | number;
  onSearch?: (query: string) => void;
}

export interface LeaderboardRecord {
  walletAddress: string;
  xp?: string;
  rank: number;
  highlighted?: boolean;
  winAmount?: string;
}
