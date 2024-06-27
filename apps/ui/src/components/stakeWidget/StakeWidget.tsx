import { FC } from 'react';
import { useAppState } from '@/hooks';

export interface StakeWidgetProps {
  currentBet: number;
  currentFighter: number;
}

export const StakeWidget: FC<StakeWidgetProps> = ({
  currentFighter,
  currentBet,
}) => {
  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  const bets = fighters.map((f, index) => {
    const bet = match?.bets[fighters[index]?.codeName];
    const stake = bet?.stake ?? 0;

    const isOpponent = index !== currentFighter;

    return {
      ...bet,
      stake,
      projectedWinRate: bet?.projectWinRate(currentBet, isOpponent),
    };
  });

  return (
    <div className="widget stake-widget">
      <div className="widget-body framed">
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

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Projected win rate:</span>
            <span>{bets[0]?.projectedWinRate ?? 0}x</span>
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

          <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
            <span>Projected win rate:</span>
            <span>{bets[1]?.projectedWinRate ?? 0}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
