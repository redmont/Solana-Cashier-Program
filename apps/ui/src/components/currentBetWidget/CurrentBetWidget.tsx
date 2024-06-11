import { FC } from 'react';
import { useAppState } from '@/hooks';

export const CurrentBetWidget: FC = () => {
  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  const bets = fighters.map((f, index) => {
    return match?.bets[fighters[index]?.codeName];
  });

  return (
    <div className="widget current-bet-widget">
      <div className="widget-body framed">
        <div className="widget-header">
          <div className="widget-label">My Stake</div>
        </div>

        <div className="fighter-bet">
          <div className="fighter-tile">
            <img src={fighters[0]?.imageUrl} />
            {fighters[0]?.displayName}
          </div>

          <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
            <span>Total staked:</span>
            <span>{bets[0]?.stake ?? 0} credits</span>
          </div>

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Current win rate:</span>
            <span>{bets[0]?.winRate ?? 0}x</span>
          </div>
        </div>

        <div className="spacer">
          <div className="separator"></div>
        </div>

        <div className="fighter-bet">
          <div className="fighter-tile">
            <img src={fighters[1]?.imageUrl} />
            {fighters[1]?.displayName}
          </div>

          <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
            <span>Total staked:</span>
            <span>{bets[1]?.stake ?? 0} credits</span>
          </div>

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Current win rate:</span>
            <span>{bets[1]?.winRate ?? 0}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
