import { FC } from 'react';
import { useAppState } from '../AppStateProvider';

export const CurrentBetWidget: FC = () => {
  const { currentBet, totalBets } = useAppState();

  return (
    <div className="widget current-bet-widget">
      <div className="widget-header">
        <div className="widget-label">My Bet</div>
      </div>

      <div className="fighter-bet">
        <div className="fighter-tile">
          <img src="/doge.svg" />
          DOGE
        </div>

        <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
          <span>Purchased Price:</span>
          <span>{currentBet?.doge ?? 0} points</span>
        </div>

        <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
          <span>Win Rewards:</span>
          <span>{totalBets.doge} points</span>
        </div>

        <div className="bet-win-rewards-comment text-white">
          (pro-rate share of opponent pool)
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
          <span>Purchased Price:</span>
          <span>{currentBet?.pepe ?? 0} points</span>
        </div>

        <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
          <span>Win Rewards:</span>
          <span>{totalBets.pepe} points</span>
        </div>

        <div className="bet-win-rewards-comment text-white">
          (pro-rate share of opponent pool)
        </div>
      </div>
    </div>
  );
};
