import { useAppState } from '@/hooks';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { FC, useCallback } from 'react';
import { toPng } from 'html-to-image';

export interface MatchResultWidgetProps {
  onDismiss?: () => void;
}

export const MatchResultWidget: FC<MatchResultWidgetProps> = ({
  onDismiss,
}) => {
  const { match } = useAppState();
  const { winner, winAmount, fighters } = match || {};
  const isWin = winAmount && +winAmount > 0;
  const winnerIndex = fighters?.findIndex((f) => f.codeName === winner);

  const share = useCallback(async () => {
    const widget = document.getElementById('match-result-widget');

    if (!widget) return;

    console.log('Generating');

    try {
      const dataUrl = await toPng(widget, { cacheBust: true });

      downloadPng(dataUrl);

      window.open(`https://twitter.com/intent/tweet`, '__blank');
    } catch {
      // TODO: show error notification
    }
  }, []);

  return (
    <div
      id="match-result-widget"
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
              <Button
                className="p-button-secondary p-button-outlined"
                label="Share"
                icon="pi pi-twitter"
                onClick={share}
              />

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

function downloadPng(dataUrl: string) {
  const link = document.createElement('a');

  link.download = 'brawlers-win.png';
  link.href = dataUrl;
  link.pathname = 'assets/png/' + link.download;
  link.click();
}
