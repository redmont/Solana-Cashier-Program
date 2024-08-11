import { Message, MessageResponse } from './message';

export interface LeaderboardItem {
  rank: number;
  username: string;
  walletAddress: string;
  winAmount?: string;
  xp?: string;
}

export interface GetLeaderboardMessageResponse
  extends Message,
    MessageResponse {
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
