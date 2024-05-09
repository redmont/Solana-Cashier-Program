'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { TwitchChat } from 'react-twitch-embed';
import { MatchStatus } from '@/types';
import { twitchChannel, streamUrl, trailerUrl } from '@/config';
import { useEthWallet, useAppState } from '@/hooks';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { ConnectWalletWidget } from '@/components/connectWalletWidget';
import { MatchResultWidget } from '@/components/matchResultWidget';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

  const { match } = useAppState();

  const isBetPlaced =
    !!match && match.bets.doge.stake + match.bets.pepe.stake > 0;

  const isMatchFinished = match?.status === MatchStatus.Finished;

  return (
    <main className="main-page">
      <div className="stream-container">
        {match?.status !== MatchStatus.Finished && (
          <iframe
            src={streamUrl}
            allowFullScreen
            width="100%"
            height="100%"
          ></iframe>
        )}

        {isMatchFinished && (
          <video
            className="trailer-video"
            autoPlay
            muted
            playsInline
            src={trailerUrl}
          />
        )}

        <img className="qrcode" src="/qrcode.png" alt="Join Barcode" />
      </div>

      <BetListWidget />

      {isReady && !isConnected && <ConnectWalletWidget />}

      {isReady && isConnected && isMatchFinished && <MatchResultWidget />}

      {isReady && isConnected && !isMatchFinished && (
        <BetPlacementWidget compact={isBetPlaced} />
      )}

      {isReady && isConnected && !isMatchFinished && isBetPlaced && (
        <CurrentBetWidget />
      )}

      <ActivityStreamWidget />

      <div className="widget stream-chat-widget">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
