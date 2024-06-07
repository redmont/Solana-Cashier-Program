'use client';

import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

dayjs.extend(duration);

import { TwitchChat } from 'react-twitch-embed';
import { MatchStatus } from '@/types';
import { twitchChannel, trailerUrl } from '@/config';
import { useEthWallet, useAppState, MatchInfo } from '@/hooks';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { ConnectWalletWidget } from '@/components/connectWalletWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';
import { VideoStream } from '@/components/videoStream';

export default function Home() {
  const { isConnected } = useEthWallet();
  const [matchResult, setMatchResult] = useState<MatchInfo | null>(null);
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();

  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

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
  }, [matchResult, match?.winAmount, match?.status, isBetPlaced]);

  const handleJoinClick = useCallback(() => {
    isConnected ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isConnected, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <main className="main-page">
      <div className="stream-container">
        {match?.status === MatchStatus.InProgress && (
          <>
            <div className="fighter-image">
              <img src={fighters[0]?.imageUrl} />
            </div>

            <div className="fighter-image">
              <img src={fighters[1]?.imageUrl} />
            </div>
          </>
        )}

        {!isConnected && (
          <img
            className="join-banner"
            src="/join-banner.jpg"
            onClick={handleJoinClick}
          />
        )}

        {isConnected && (
          <>
            <VideoStream
              src={
                match?.status !== MatchStatus.Finished
                  ? undefined
                  : match?.preMatchVideoUrl ?? trailerUrl
              }
            />

            <img className="qrcode" src="/qrcode.png" alt="Join Barcode" />
          </>
        )}
      </div>

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
