import { MatchInfo, useAppState } from '@/hooks';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { FC, useCallback, useEffect } from 'react';

export interface MatchResultWidgetProps {
  result: MatchInfo;
  onDismiss?: () => void;
}

export const MatchResultWidget: FC<MatchResultWidgetProps> = ({
  result,
  onDismiss,
}) => {
  const { winner, fighters, winAmount } = result ?? {};
  const isWin = winAmount && +winAmount > 0;
  const winnerIndex = fighters?.findIndex((f) => f.codeName === winner);

  // Temporarily disabled
  // const share = useCallback(() => {
  //   window.open(
  //     `https://twitter.com/intent/tweet?text=${encodeURI('Hello World')}`,
  //     '__blank',
  //   );
  // }, []);

  return (
    <div
      className={classNames('widget match-result-widget', {
        'winner-fighter-2': winnerIndex === 1,
      })}
    >
      <div className="widget-body framed">
        <div className="widget-header">
          <div className="widget-label">Match Finished</div>
        </div>

        <div className="widget-content">
          <div className="fighter-image-box">
            <img
              className="fighter-image fighter-image-1"
              src={fighters?.[0]?.imageUrl}
            />
            <img
              className="fighter-image fighter-image-2"
              src={fighters?.[1]?.imageUrl}
            />
          </div>

          <div className="result-info">
            <div className="result-title">{winner} Wins!</div>

            <div className="win-amount">{`+${isWin ? winAmount : 0}`}</div>

            <div className="widget-actions">
              {/* <Button
                className="p-button-secondary p-button-outlined"
                label="Share"
                icon="pi pi-twitter"
                onClick={share}
              /> */}

              <Button
                className="p-button-secondary p-button-outlined"
                label="Next Fight"
                onClick={onDismiss}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
