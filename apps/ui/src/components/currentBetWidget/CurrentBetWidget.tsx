import { FC } from 'react';
import { useAppState } from '../appStateProvider/AppStateProvider';

export const CurrentBetWidget: FC = () => {
  const { match } = useAppState();

  return (
    <div className="widget current-bet-widget">
      <div className="widget-body framed">
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
            <span>{match?.bets.doge.stake} points</span>
          </div>

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Current win rate:</span>
            <span>{match?.bets.doge.winRate}x</span>
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
            <span>{match?.bets.pepe.stake} points</span>
          </div>

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Current win rate:</span>
            <span>{match?.bets.pepe.winRate}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
