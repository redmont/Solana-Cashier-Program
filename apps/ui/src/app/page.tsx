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
    <main className="flex flex-grow-1">
      <div className="layout-left-sidebar">
        <BetListWidget />
      </div>

      <div className="layout-content">
        <div className="main-page">
          <div className="match-stream-container">
            <img className="stream-placeholder" src="/match.png" />
          </div>

          <div className="match-bet-container">
            {isReady && !isConnected && (
              <div className="connect-wallet-panel">
                <EthConnectButton size="large" />
              </div>
            )}

            {isReady && isConnected && currentBets && <CurrentBetWidget />}

            {isReady && isConnected && (
              <BetPlacementWidget compact={!!currentBets} />
            )}
            {/* {isReady && isConnected && <HistoricalBetPanel />} */}
          </div>
        </div>
      </div>

      <div className="layout-right-sidebar">
        <div className="activity-stream-container">
          <ActivityStream />
        </div>

        <div className="stream-chat-container">
          <TwitchChat channel={twitchChannel} width="100%" height="100%" />
        </div>
      </div>
    </main>
  );
}
