import { Message } from './message';

export interface LeaderboardItem {
  rank: number;
  walletAddress: string;
  balance: string;
}

export interface GetLeaderboardMessageResponse extends Message {
  totalCount: number;
  items: LeaderboardItem[];
  success: boolean;
  currentUserItem?: LeaderboardItem;
}

export class GetLeaderboardMessage extends Message<GetLeaderboardMessageResponse> {
  static messageType = 'getLeaderboard';
  constructor(
    public readonly pageSize?: number,
    public readonly page?: number,
    public readonly searchQuery?: string,
  ) {
    super();
  }
}
