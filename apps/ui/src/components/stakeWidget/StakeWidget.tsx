import { FC, Fragment } from 'react';
import { Tooltip } from '../Tooltip';
import { useAtomValue } from 'jotai';
import { fighterBettingInformationAtom } from '@/store/match';

export const StakeWidget: FC = () => {
  const bettingInfos = useAtomValue(fighterBettingInformationAtom);

  return (
    <div className="widget stake-widget">
      <div className="widget-body framed">
        {bettingInfos.map(({ stake, fighter, winRate }) => (
          <Fragment key={fighter.codeName}>
            <div className="fighter-bet">
              <div className="fighter-tile">
                <img src={fighter.imageUrl} />
                {fighter.displayName}
              </div>

              <Tooltip
                content={`Your existing stake on ${fighter.displayName}`}
              >
                <div className="bet-purchase-price mt-3 flex justify-between text-white">
                  <span className="font-semibold">My Stake:</span>{' '}
                  <span>{stake ?? 0} credits</span>
                </div>
              </Tooltip>

              <div className="bet-win-rewards mt-2 flex justify-between text-white">
                <span className="font-semibold">Current win rate:</span>{' '}
                <span>{winRate ?? 0}x</span>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
