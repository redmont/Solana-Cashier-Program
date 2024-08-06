export interface LeaderboardProps {
  records: LeaderboardRecord[];
  tournamentValue?: any;
  winNamed?: string;
}

export interface LeaderboardWidgetProps extends LeaderboardProps {
  currentUserItem: LeaderboardUserRecord | null;
  searchQuery?: string;
  endDateTime: string | number;
  startDateTime: string | number;
  currentRound: number;
  roundEndDate: string | number;
  currentTab: 'daily' | 'xp';
  onTabChange: (tab: 'daily' | 'xp') => void;
  onSearch?: (query: string) => void;
}

export interface LeaderboardRecord {
  username?: string;
  walletAddress: string;
  xp?: string;
  rank: number;
  highlighted?: boolean;
  winAmount?: string;
  value?: string;
  valueName?: string;
}

export interface LeaderboardUserRecord {
  username?: string;
  walletAddress: string;
  xp?: string;
  winAmount?: string;
  rank: number;
}
