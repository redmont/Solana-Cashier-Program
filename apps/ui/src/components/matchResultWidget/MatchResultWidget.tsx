import { Button } from '@/components/ui/button';
import { classNames } from 'primereact/utils';
import { FC, useCallback, useEffect, useState } from 'react';
import { toPng } from 'html-to-image';
import { useAtomValue } from 'jotai';
import {
  fightersAtom,
  matchIdAtom,
  MatchResult,
  matchResultAtom,
  matchStatusAtom,
} from '@/store/match';
import { Fighter } from '@/types';

type ResultCache = {
  result: MatchResult;
  winner: Fighter;
  loser: Fighter;
};

export const MatchResultWidget: FC = () => {
  const [cachedResult, setCachedResult] = useState<ResultCache | null>(null);
  const matchStatus = useAtomValue(matchStatusAtom);
  const matchId = useAtomValue(matchIdAtom);
  const imageEnabled = false;
  const fighters = useAtomValue(fightersAtom);
  const results = useAtomValue(matchResultAtom);

  const [isSavingPng, setSavingPng] = useState(false);
  const [isPngSaved, setPngSaved] = useState(false);

  useEffect(() => {
    const isWin =
      results?.matchId === matchId &&
      results?.winAmount &&
      +results.winAmount > 0;
    if (matchStatus === 'matchFinished' && isWin) {
      const winner = fighters.find(
        (f) => f?.codeName && f.codeName === results?.winner,
      );
      const loser = fighters.find(
        (f) => f?.codeName && f.codeName !== results?.winner,
      );
      if (winner && loser) {
        setCachedResult({
          result: results,
          winner,
          loser,
        });
      }
    }
  }, [fighters, matchId, matchStatus, results]);

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
    setCachedResult(null);
    setPngSaved(false);
  }, []);

  useEffect(() => {
    if (!imageEnabled || !isSavingPng) {
      return;
    }

    generateImage();
  }, [isSavingPng, imageEnabled, generateImage]);

  const share = useCallback(async () => {
    if (!cachedResult) {
      return;
    }
    const {
      winner,
      loser,
      result: { winAmount },
    } = cachedResult;
    const text = encodeURIComponent(
      `🥊 ${winner?.displayName} conquers ${loser?.displayName} in @BRAWL3RS!\
      \n🪙 Banked +${winAmount} Brawl3r credits and shot up the leaderboard.\
      \n🏆 Eyeing those tournament prizes. Who's next??`,
    );

    const hashtags = ['LFB'].join(',');

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}`,
      '__blank',
    );
  }, [cachedResult]);

  return (
    cachedResult && (
      <div
        id="match-result-widget"
        className={classNames('widget match-result-widget')}
      >
        <div className="widget-body framed">
          {isSavingPng && (
            <img className="qrcode" src="/qrcode.png" alt="Join Barcode" />
          )}

          <div className="widget-content">
            <div className="fighter-image-box">
              <img
                className={classNames('fighter-image')}
                src={cachedResult?.winner.imageUrl}
              />
            </div>

            <div className="result-info">
              <div className="result-title">
                {cachedResult?.winner.displayName} Wins!
              </div>

              <div className="win-amount">{`+${+cachedResult?.result.winAmount > 0 ? cachedResult.result?.winAmount : 0}`}</div>

              {!isSavingPng && (
                <div className="widget-actions">
                  {imageEnabled && !isPngSaved && (
                    <Button onClick={() => setSavingPng(true)}>
                      Get Result Image
                    </Button>
                  )}

                  {(!imageEnabled || isPngSaved) && (
                    <Button onClick={share}>
                      <span>Share on</span> <i className="pi pi-twitter" />
                    </Button>
                  )}

                  <Button onClick={dismiss}>Dismiss</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

function downloadPng(dataUrl: string) {
  const link = document.createElement('a');

  link.download = 'brawlers-match-result.png';
  link.href = dataUrl;
  link.pathname = 'assets/png/' + link.download;
  link.click();
}
