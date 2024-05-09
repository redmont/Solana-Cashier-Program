import { Message } from './message';

export interface GetLeaderboardMessageResponse extends Message {
  totalCount: number;
  items: {
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
  ) {
    super();
  }
}
