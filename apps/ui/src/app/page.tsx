'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { useEthWallet, useAppState } from '@/hooks';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { twitchChannel } from '@/config';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { TwitchChat } from 'react-twitch-embed';
import { trailerUrl } from '@/config';
import { ConnectWalletWidget } from '@/components/connectWalletWidget';
import { MatchStatus } from '@/types';
import { VideoStream } from '@/components/videoStream';

export default function Home() {
  const { isConnected } = useEthWallet();

  const { match } = useAppState();
  const { fighters = [] } = match ?? {};

  const isBetPlaced = !!(
    match &&
    match?.fighters.reduce((result, { codeName }) => {
      return result + (match.bets[codeName]?.stake ?? 0);
    }, 0)
  );

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

        <VideoStream
          src={
            match?.status !== MatchStatus.Finished
              ? undefined
              : match?.preMatchVideoUrl ?? trailerUrl
          }
        />

        <img className="qrcode" src="/qrcode.png" alt="Join Barcode" />
      </div>

      <BetListWidget />

      {!isConnected && <ConnectWalletWidget />}

      {isConnected && <BetPlacementWidget compact={isBetPlaced} />}

      {isConnected && isBetPlaced && <CurrentBetWidget />}

      <ActivityStreamWidget />

      <div className="widget stream-chat-widget">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
