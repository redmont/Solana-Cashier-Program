import { Button } from '@/components/ui/button';
import { FC, useCallback, useEffect, useState } from 'react';
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
  const fighters = useAtomValue(fightersAtom);
  const results = useAtomValue(matchResultAtom);

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

  const dismiss = useCallback(() => {
    setCachedResult(null);
  }, []);

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
        className="widget match-result-widget relative z-10"
      >
        <div className="widget-body framed flex h-full flex-col items-center justify-center">
          <div className="widget-content flex items-center justify-center gap-5">
            <div className="size-28 shrink-0 bg-primary/25 xs:size-40">
              <img className="size-full" src={cachedResult?.winner.imageUrl} />
            </div>

            <div className="flex flex-col justify-between self-stretch">
              <div className="text-lg font-semibold uppercase xs:text-3xl">
                {cachedResult?.winner.displayName} Wins!
              </div>

              <div className="inline-flex items-end gap-2 leading-none text-primary">
                <span className="text-xl leading-none xs:text-4xl">
                  {`+${+cachedResult?.result.winAmount > 0 ? cachedResult.result?.winAmount : 0}`}
                </span>
                <span className="text-md sm:text-xl">Credits</span>
              </div>
              <div className="my-2 flex w-full justify-center gap-3">
                <Button
                  className="h-8 p-1 text-xs xs:h-10 xs:px-2 xs:py-5 xs:text-[1rem]"
                  onClick={share}
                >
                  <span>Share on</span> <i className="pi pi-twitter" />
                </Button>

                <Button
                  className="h-8 p-1 text-xs xs:h-10 xs:px-2 xs:py-5 xs:text-[1rem]"
                  onClick={dismiss}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
