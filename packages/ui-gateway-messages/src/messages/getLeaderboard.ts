import { Message } from './message';

export interface GetLeaderboardMessageResponse extends Message {
  totalCount: number;
  items: {
    rank: number;
    walletAddress: string;
    balance: string;
  }[];
  success: boolean;
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
