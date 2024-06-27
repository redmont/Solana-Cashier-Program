import { FC, Fragment } from 'react';
import { useAppState } from '@/hooks';
import { Tooltip } from '../Tooltip';

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
        {fighters.map((fighter, i) => (
          <>
            <div className="fighter-bet" key={fighter.codeName}>
              <div className="fighter-tile">
                <img src={fighter.imageUrl} />
                {fighter.displayName}
              </div>
              <Tooltip
                content={`Your existing stake on ${fighter.displayName}`}
              >
                <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
                  <span>Total staked:</span>
                  <span>{bets[i]?.stake ?? 0} credits</span>
                </div>
              </Tooltip>

              <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
                <span>Current win rate:</span>
                <span>{bets[i]?.winRate ?? 0}x</span>
              </div>

              <Tooltip
                content={`Your projected win rate once you confirm your stake`}
              >
                <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
                  <span>Projected win rate:</span>
                  <span>{bets[i]?.projectedWinRate ?? 0}x</span>
                </div>
              </Tooltip>
            </div>
            {i % 2 === 0 && (
              <div className="spacer">
                <div className="separator"></div>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};
