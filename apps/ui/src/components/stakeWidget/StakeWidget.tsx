import { FC, Fragment } from 'react';
import { useAppState } from '@/hooks';
import { Tooltip } from '../Tooltip';

export interface StakeWidgetProps {
  currentFighter: number;
}

export const StakeWidget: FC<StakeWidgetProps> = () => {
  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  const bets = fighters.map((f, index) => {
    const bet = match?.bets[fighters[index]?.codeName];
    const stake = bet?.stake ?? 0;

    return {
      ...bet,
      stake,
    };
  });

  return (
    <div className="widget stake-widget">
      <div className="widget-body framed">
        {fighters.map((fighter, i) => (
          <Fragment key={fighter.codeName}>
            <div className="fighter-bet">
              <div className="fighter-tile">
                <img src={fighter.imageUrl} />
                {fighter.displayName}
              </div>

              <Tooltip
                content={`Your existing stake on ${fighter.displayName}`}
              >
                <div className="bet-purchase-price mt-3 flex justify-content-between text-white">
                  <span>My Stake</span>
                  <span>{bets[i]?.stake ?? 0} credits</span>
                </div>
              </Tooltip>

              <div className="bet-win-rewards mt-2 flex justify-content-between text-white">
                <span>Current win rate:</span>
                <span>{bets[i]?.winRate ?? 0}x</span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
