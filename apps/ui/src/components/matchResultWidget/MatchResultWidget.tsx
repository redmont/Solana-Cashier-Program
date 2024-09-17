import { Button } from '@/components/ui/button';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  fighterBettingInformationAtom,
  fightersAtom,
  matchIdAtom,
  MatchResult,
  matchResultAtom,
  matchStatusAtom,
} from '@/store/match';
import { Fighter } from '@/types';
import { useSfx } from '@/hooks';
import { formatCreditAmount } from '@/utils';

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

  const bets = useAtomValue(fighterBettingInformationAtom);
  const sfx = useSfx();

  const matchHasStake = useMemo(() => {
    const [{ stake: stake1 = 0 } = {}, { stake: stake2 = 0 } = {}] = bets;

    return stake1 + stake2 !== 0;
  }, [bets]);

  useEffect(() => {
    if (
      matchStatus !== 'matchFinished' ||
      results?.matchId !== matchId ||
      !matchHasStake
    ) {
      return;
    }

    const isWin = results?.winAmount && +results.winAmount > 0;

    if (isWin) {
      sfx.stakeWon();

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
    } else {
      return sfx.stakeLost();
    }
  }, [fighters, matchId, matchStatus, results, matchHasStake, sfx]);

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
      \n🪙 Banked +$${formatCreditAmount(winAmount)} and shot up the leaderboard.\
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
                  {`+$${formatCreditAmount(+cachedResult?.result.winAmount > 0 ? cachedResult.result?.winAmount : 0)}`}
                </span>
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
