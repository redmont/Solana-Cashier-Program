import { useAppState } from '../components/AppStateProvider';
import { Fighter } from '@/types';

export function useRewardRates() {
  const { currentBets, totalBets } = useAppState();

  function getTotalRewards(fighter: Fighter) {
    const opponent: Fighter = fighter === 'doge' ? 'pepe' : 'doge';
    const currentBetAmount = currentBets?.[fighter] ?? 0;

    if (!currentBetAmount) return '1.00';

    const totalBet = totalBets[fighter];
    const opTotalBet = totalBets[opponent];

    const rate = totalBet ? currentBetAmount / totalBet : 0;
    const win = opTotalBet * rate + currentBetAmount;

    return (win / currentBetAmount).toFixed(2);
  }

  return {
    doge: getTotalRewards('doge'),
    pepe: getTotalRewards('pepe'),
  } as Record<Fighter, string>;
}
