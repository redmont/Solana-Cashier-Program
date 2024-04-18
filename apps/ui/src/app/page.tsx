'use client';

import { useAppState } from '@/components/AppStateProvider';
import { EthConnectButton, useEthWallet } from '@/components/web3';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { HistoricalBetPanel } from '@/components/historicalBetPanel';
import { twitchChannel } from '@/config';
import { BetListWidget } from '@/components/betListWidget';
import { StreamChat } from '@/components/streamChat';
import { ActivityStream } from '@/components/activityStream';
import { TwitchChat } from 'react-twitch-embed';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

  const { currentBets } = useAppState();

  return (
    <main>
      <div className="stream-container">
        <img className="stream-placeholder" src="/match.png" />
      </div>

      {/* {isReady && isConnected && <BetPlacementWidget compact={!!currentBets} />} */}

      {isReady && isConnected && (
        <div className="widget-container">
          <BetPlacementWidget compact />
        </div>
      )}

      {isReady && isConnected && currentBets && (
        <div className="widget-container">
          <CurrentBetWidget />
        </div>
      )}

      <div className="widget-container">
        <ActivityStream />
      </div>

      <div className="widget-container stream-chat-container">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
