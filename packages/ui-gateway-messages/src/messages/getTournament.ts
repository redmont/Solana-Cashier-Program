import { Message } from './message';

export interface TournamentLeaderboardItem {
  rank: number;
  walletAddress: string;
  xp?: string;
  winAmount?: string;
}

export interface GetTournamentMessageResponse extends Message {
  displayName: string;
  description: string;
  startDate: string;
  endDate: string;
  currentRound: number;
  roundEndDate: string;
  prizes: {
    title: string;
    description: string;
  }[];
  totalCount: number;
  items: TournamentLeaderboardItem[];
  success: boolean;
  currentUserItem?: TournamentLeaderboardItem;
}

export class GetTournamentMessage extends Message<GetTournamentMessageResponse> {
  static messageType = 'getTournament';
  constructor(
    public readonly sortBy?: 'xp' | 'winAmount',
    public readonly pageSize?: number,
    public readonly page?: number,
    public readonly searchQuery?: string,
  ) {
    super();
  }
}
