'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { TwitchChat } from 'react-twitch-embed';
import { MatchStatus } from '@/types';
import { twitchChannel } from '@/config';
import { useEthWallet, useAppState, MatchInfo } from '@/hooks';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { ConnectWalletWidget } from '@/components/connectWalletWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';
import { MatchStreamWidget } from '@/components/matchStreamWidget';

export default function Home() {
  const { isConnected } = useEthWallet();
  const [matchResult, setMatchResult] = useState<MatchInfo | null>(null);

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
      <MatchStreamWidget />

      <BetListWidget />

      {!isConnected && <ConnectWalletWidget />}

      {isConnected && matchResult && (
        <MatchResultWidget
          result={matchResult}
          onDismiss={() => setMatchResult(null)}
        />
      )}

      {isConnected && !matchResult && (
        <BetPlacementWidget compact={isBetPlaced} />
      )}

      {isConnected && !matchResult && isBetPlaced && <CurrentBetWidget />}

      <ActivityStreamWidget />

      <div className="widget stream-chat-widget">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
