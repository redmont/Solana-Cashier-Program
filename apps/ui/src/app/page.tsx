'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { MatchStatus } from '@/types';
import { useAppState, MatchInfo } from '@/hooks';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { StakeWidget } from '@/components/stakeWidget';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';
import { MatchStreamWidget } from '@/components/matchStreamWidget';
import { MatchStatusWidget } from '@/components/matchStatusWidget';

export default function Home() {
  const [matchResult, setMatchResult] = useState<MatchInfo | null>(null);
  const [currentFighter, setCurrentFighter] = useState(0);
  const [currentBet, setCurrentBet] = useState<number>(0);

  const { match } = useAppState();

  const isBetPlaced = !!(
    match &&
    match?.fighters.reduce((result, { codeName }) => {
      return result + (match.bets[codeName]?.stake ?? 0);
    }, 0)
  );

  useEffect(() => {
    if (
      // Match result is present
      (!matchResult && match?.status === MatchStatus.Finished && isBetPlaced) ||
      // Win amount is updated
      (match && matchResult && matchResult?.winAmount !== match?.winAmount)
    ) {
      setMatchResult(match);
    }
  }, [matchResult, match, match?.winAmount, match?.status, isBetPlaced]);

  return (
    <main className="main-page">
      <div className="main-page-content">
        <MatchStreamWidget />

        <BetListWidget />

        <MatchStatusWidget />

        {matchResult && (
          <MatchResultWidget
            result={matchResult}
            onDismiss={() => setMatchResult(null)}
          />
        )}

        {!matchResult && (
          <BetPlacementWidget
            fighter={currentFighter}
            betAmount={currentBet}
            onBetChange={setCurrentBet}
            onFighterChange={setCurrentFighter}
          />
        )}

        {!matchResult && <StakeWidget currentFighter={currentFighter} />}

        <ActivityStreamWidget />
      </div>
    </main>
  );
}
