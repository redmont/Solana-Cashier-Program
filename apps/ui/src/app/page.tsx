'use client';

import { useAppState } from '@/components/AppStateProvider';
import { EthConnectButton, useEthWallet } from '@/components/web3';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { HistoricalBetPanel } from '@/components/historicalBetPanel';
import { twitchChannel } from '@/config';
import { BetListWidget } from '@/components/betListWidget';
import { ActivityStreamWidget } from '@/components/activityStreamWidget';
import { TwitchChat } from 'react-twitch-embed';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

  const { currentBets } = useAppState();

  return (
    <main>
      <div className="stream-container">
        <iframe
          src="https://viewer.millicast.com?streamId=WBYdQB/brawlers-dev-1&controls=false&showLabels=false"
          allowFullScreen
          width="100%"
          height="100%"
        ></iframe>
      </div>

      <BetListWidget />

      {isReady && isConnected && <BetPlacementWidget compact={!!currentBets} />}

      {isReady && isConnected && currentBets && <CurrentBetWidget />}

      <ActivityStreamWidget />

      <div className="widget stream-chat-widget">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
