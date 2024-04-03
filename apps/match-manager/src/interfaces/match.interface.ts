import { DateTime } from "luxon";

export type MatchState = "AcceptingBets" | "InProgress" | "Completed";

export interface Bet {
  userId: string;
  fighter: string;
  walletAddress: string;
  amount: number;
}

export interface Match {
  state: MatchState;
  bets: Bet[];
  startTime: DateTime;
}
