import { MatchInfo } from '@/hooks';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { FC, useCallback, useEffect, useState } from 'react';
import { toPng } from 'html-to-image';

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
  const [isSavingPng, setSavingPng] = useState(false);
  const [isPngSaved, setPngSaved] = useState(false);

  const generateImage = useCallback(async () => {
    const widget = document.getElementById('match-result-widget');

    if (!widget) {
      return setSavingPng(false);
    }

    try {
      const dataUrl = await toPng(widget);

      downloadPng(dataUrl);

      setPngSaved(true);
    } catch {
      // TODO: show error notification
    } finally {
      setSavingPng(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setPngSaved(false);

    onDismiss && onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!isSavingPng) return;

    generateImage();
  }, [isSavingPng, generateImage]);

  const share = useCallback(async () => {
    const text = encodeURI(
      `Another epic battle in @Brawl3rs! 🥊 Join the fight to win tournament prizes at www.frogsvdogs.ai.`,
    );

    const hashtags = ['LFB'].join(',');

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`,
      '__blank',
    );
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

        {isSavingPng && (
          <img className="qrcode" src="/qrcode.png" alt="Join Barcode" />
        )}

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

            {!isSavingPng && (
              <div className="widget-actions">
                {!isPngSaved && (
                  <Button
                    className="p-button-secondary p-button-outlined"
                    label="Get Result Image"
                    onClick={() => setSavingPng(true)}
                  />
                )}

                {isPngSaved && (
                  <Button
                    className="p-button-secondary p-button-outlined"
                    label="Share"
                    icon="pi pi-twitter"
                    onClick={share}
                  />
                )}

                <Button
                  className="p-button-secondary p-button-outlined"
                  label="Next Fight"
                  onClick={dismiss}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function downloadPng(dataUrl: string) {
  const link = document.createElement('a');

  link.download = 'brawlers-match-result.png';
  link.href = dataUrl;
  link.pathname = 'assets/png/' + link.download;
  link.click();
}
