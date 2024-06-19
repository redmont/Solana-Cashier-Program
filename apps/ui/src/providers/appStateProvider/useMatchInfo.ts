import { useMemo } from 'react';

import { Bet, MatchStatus } from '@/types';
import { useEthWallet } from '@/hooks';
import { MatchState, useMatchState } from './useMatchState';

export interface FighterBets {
  list: Bet[];
  total: number;
  stake: number;
  winRate: string;
  projectWinRate: (stakeAddon: number, isForOpponent: boolean) => string;
}

export type MatchInfo = Omit<MatchState, 'bets' | 'state'> & {
  bets: Record<string, FighterBets>;
  status: MatchStatus;
  preMatchVideoUrl: string;
  matchId?: string;
  series?: string;
};

const initBetsInfo = (stake = 0, total = 0) => ({
  list: [],
  total,
  stake,
  winRate: '1.00',
  projectWinRate: () => '1.00',
});

export function useMatchInfo() {
  const { bets, state, ...matchState } = useMatchState();

  const { address: walletAddress } = useEthWallet();

  return useMemo(() => {
    const fighters = matchState.fighters.map((f) => f.codeName);

    const result: MatchInfo = {
      ...matchState,
      status: state as MatchStatus,
      bets: {
        [fighters[0]]: initBetsInfo(),
        [fighters[1]]: initBetsInfo(),
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

    const calcWinRate = (
      fighter: string,
      addon: number = 0,
      isForOpponent = false,
    ) => {
      const info = result.bets[fighter];
      const fighterIndex = fighters.indexOf(fighter);
      const opponent = fighters[(fighterIndex + 1) % 2];

      const fighterAddon = isForOpponent ? 0 : addon;
      const opponentAddon = isForOpponent ? addon : 0;

      const stake = info.stake + fighterAddon;
      const totalBet = info.total + fighterAddon;

      if (!stake) return 1;

      const opTotalBet = result.bets[opponent].total + opponentAddon;

      const rate = totalBet ? stake / totalBet : 0;
      const win = opTotalBet * rate + stake;

      return win / stake;
    };

    Object.entries(result.bets).forEach(([fighter, info]) => {
      info.list.sort((a, b) => +b.amount - +a.amount);

      info.winRate = calcWinRate(fighter).toFixed(2);

      info.projectWinRate = (stakeAddon: number, isForOpponent: boolean) =>
        calcWinRate(fighter, stakeAddon, isForOpponent).toFixed(2);
    });

    return result;
  }, [state, bets, matchState, walletAddress]);
}
