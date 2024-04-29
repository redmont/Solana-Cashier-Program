'use client';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

import { useAppState } from '@/components/appStateProvider';
import { useEthWallet } from '@/components/web3';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { twitchChannel } from '@/config';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { TwitchChat } from 'react-twitch-embed';
import { streamUrl } from '@/config';
import { ConnectWalletWidget } from '@/components/connectWalletWidget';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

  const { match } = useAppState();

  const isBetPlaced =
    !!match && match.bets.doge.stake + match.bets.pepe.stake > 0;

  return (
    <main>
      <div className="stream-container">
        <iframe
          src={streamUrl}
          allowFullScreen
          width="100%"
          height="100%"
        ></iframe>

        <img className="qrcode" src="/qrcode.png" alt="Join Barcode" />
      </div>

      <BetListWidget />

      {isReady && !isConnected && <ConnectWalletWidget />}

      {isReady && isConnected && <BetPlacementWidget compact={isBetPlaced} />}

      {isReady && isConnected && isBetPlaced && <CurrentBetWidget />}

      <ActivityStreamWidget />

      <div className="widget stream-chat-widget">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
