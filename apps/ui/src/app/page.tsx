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
import {
  TutorialDialog,
  shouldShowTutorial,
} from '@/components/tutorialDialog';
import { MatchStatusWidget } from '@/components/matchStatusWidget';

export default function Home() {
  const [welcomeVisible, setWelcomeVisible] = useState(false);
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
    setWelcomeVisible(shouldShowTutorial());
  }, []);

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
      <MatchStreamWidget />

      <BetListWidget />

      <TutorialDialog
        visible={welcomeVisible}
        onHide={() => setWelcomeVisible(false)}
      />

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

      {!matchResult && (
        <StakeWidget currentBet={currentBet} currentFighter={currentFighter} />
      )}

      <ActivityStreamWidget />
    </main>
  );
}
