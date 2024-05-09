import { useAppState } from '@/hooks';
import { useMatchInfo } from '@/providers/appStateProvider/useMatchInfo';
import { Fighter } from '@/types';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { FC } from 'react';

export const MatchResultWidget: FC = () => {
  const { match } = useAppState();
  const { winner } = match || {};

  return (
    <div
      className={classNames('widget match-result-widget', `winner-${winner}`)}
    >
      <div className="widget-body framed">
        <div className="widget-header">
          <div className="widget-label">Match Finished</div>
        </div>

        <div className="widget-content">
          <div className="fighter-image-box">
            <img className="fighter-image doge-image" src="/doge.svg" />
            <img className="fighter-image pepe-image" src="/pepe.svg" />
          </div>

          <div className="result-info">
            <div className="result-title">{winner} Wins!</div>

            <div className="win-amount">+2600</div>

            <div className="bet-info">
              <div className="bet-info-label">Staked amount:</div>
              <div className="bet-info-value">50 points</div>
            </div>

            <div className="bet-info">
              <div className="bet-info-label">Win rate:</div>
              <div className="bet-info-value">1.20x</div>
            </div>

            <div className="widget-actions">
              <Button
                className="p-button-secondary p-button-outlined"
                label="Next Fight"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
