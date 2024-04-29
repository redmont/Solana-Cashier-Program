import { Fighter, Bet } from '@/types';
import { useMemo } from 'react';
import { useEthWallet } from '../web3';

import { MatchState, useMatchState } from './useMatchState';

export interface FighterBets {
  list: Bet[];
  total: number;
  stake: number;
  winRate: string;
}

export enum MatchStatus {
  Unknown = '',
  BetsOpen = 'bettingOpen',
  PendingStart = 'pendingStart',
  InProgress = 'matchInProgress',
  Finished = 'matchFinished',
}

export type MatchInfo = Omit<MatchState, 'bets' | 'state'> & {
  bets: Record<Fighter, FighterBets>;
  status: MatchStatus;
  matchId?: string;
};

export function useMatchInfo() {
  const { bets, state, ...matchState } = useMatchState();

  const { address } = useEthWallet();

  return useMemo(() => {
    const result: MatchInfo = {
      ...matchState,
      status: state as MatchStatus,
      bets: {
        pepe: { list: [], total: 0, stake: 0, winRate: '1.00' },
        doge: { list: [], total: 0, stake: 0, winRate: '1.00' },
      },
    };

    bets.forEach((bet) => {
      const fighterBets = result.bets[bet.fighter as Fighter];

      if (!fighterBets) return;

      fighterBets.list.push(bet);
      fighterBets.total += +bet.amount;

      if (address === bet.walletAddress) {
        fighterBets.stake += +bet.amount;
      }
    });

    Object.entries(result.bets).forEach(([fighter, info]) => {
      const opponent: Fighter = fighter === 'doge' ? 'pepe' : 'doge';

      if (!info.stake) return '1.00';

      const opTotalBet = result.bets[opponent].total;

      const rate = info.total ? info.stake / info.total : 0;
      const win = opTotalBet * rate + info.stake;

      result.bets[fighter as Fighter].winRate = (win / info.stake).toFixed(2);
    });

    return result;
  }, [bets, matchState]);
}
