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

      <div className="widget-container bet-list-container">
        <BetListWidget />
      </div>

      {isReady && isConnected && (
        <div className="widget-container bet-placement-container">
          <BetPlacementWidget compact={!!currentBets} />
        </div>
      )}

      {isReady && isConnected && currentBets && (
        <div className="widget-container current-bet-container">
          <CurrentBetWidget />
        </div>
      )}

      <div className="widget-container activity-stream-container">
        <ActivityStream />
      </div>

      <div className="widget-container stream-chat-container">
        <TwitchChat channel={twitchChannel} width="100%" height="100%" />
      </div>
    </main>
  );
}
