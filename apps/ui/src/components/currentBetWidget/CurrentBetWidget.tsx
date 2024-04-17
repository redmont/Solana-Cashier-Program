import { FC } from 'react';
import { useAppState } from '../AppStateProvider';
import { useRewardRates } from '@/hooks/useRewardRates';

export const CurrentBetWidget: FC = () => {
  const { currentBets } = useAppState();
  const { doge: dogeReward, pepe: pepeReward } = useRewardRates();

  return (
    <div className="widget current-bet-widget">
      <div className="widget-header">
        <div className="widget-label">My Stake</div>
      </div>

      <div className="fighter-bet">
        <div className="fighter-tile">
          <img src="/doge.svg" />
          DOGE
        </div>

        <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
          <span>Total staked:</span>
          <span>{currentBets?.doge ?? 0} points</span>
        </div>

        <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
          <span>Current win rate:</span>
          <span>{dogeReward}x</span>
        </div>
      </div>

      <div className="spacer">
        <div className="separator"></div>
      </div>

      <div className="fighter-bet">
        <div className="fighter-tile">
          <img src="/pepe.svg" />
          PEPE
        </div>

        <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
          <span>Total staked:</span>
          <span>{currentBets?.pepe ?? 0} points</span>
        </div>

        <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
          <span>Current win rate:</span>
          <span>{pepeReward}x</span>
        </div>
      </div>
    </div>
  );
};
