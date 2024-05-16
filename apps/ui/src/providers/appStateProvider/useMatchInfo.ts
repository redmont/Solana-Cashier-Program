import { useMemo } from 'react';

import { Bet, MatchStatus } from '@/types';
import { useEthWallet } from '@/hooks';
import { MatchState, useMatchState } from './useMatchState';

export interface FighterBets {
  list: Bet[];
  total: number;
  stake: number;
  winRate: string;
}

export type MatchInfo = Omit<MatchState, 'bets' | 'state'> & {
  bets: Record<string, FighterBets>;
  status: MatchStatus;
  matchId?: string;
  series?: string;
};

export function useMatchInfo() {
  const { bets, state, ...matchState } = useMatchState();

  const { address: walletAddress } = useEthWallet();

  return useMemo(() => {
    const fighters = matchState.fighters.map((f) => f.codeName);

    const result: MatchInfo = {
      ...matchState,
      status: state as MatchStatus,
      bets: {
        [fighters[0]]: { list: [], total: 0, stake: 0, winRate: '1.00' },
        [fighters[1]]: { list: [], total: 0, stake: 0, winRate: '1.00' },
      },
    };

    bets.forEach((bet) => {
      const fighterBets = result.bets[bet.fighter];

      if (!fighterBets) return;

      fighterBets.list.push(bet);
      fighterBets.total += +bet.amount;

      if (walletAddress === bet.walletAddress) {
        fighterBets.stake += +bet.amount;
      }
    });

    Object.entries(result.bets).forEach(([fighter, info]) => {
      const fighterIndex = fighters.indexOf(fighter);
      const opponent = fighters[(fighterIndex + 1) % 2];

      info.list.sort((a, b) => +b.amount - +a.amount);

      if (!info.stake) return '1.00';

      const opTotalBet = result.bets[opponent].total;

      const rate = info.total ? info.stake / info.total : 0;
      const win = opTotalBet * rate + info.stake;

      result.bets[fighter].winRate = (win / info.stake).toFixed(2);
    });

    return result;
  }, [state, bets, matchState, walletAddress]);
}
