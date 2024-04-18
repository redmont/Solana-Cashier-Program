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
      <div className="left-sidebar">
        <BetListWidget />
      </div>

      <div className="trunk">
        <div className="trunk-body">
          <div className="stream-container">
            <img className="stream-placeholder" src="/match.png" />
          </div>

          <div className="widgets-container">
            <BetListWidget />

            <ActivityStream />

            {/* {isReady && !isConnected && (
              <div className="connect-wallet-panel">
                <EthConnectButton size="large" />
              </div>
            )}*/}

            {isReady && isConnected && currentBets && <CurrentBetWidget />}

            {isReady && isConnected && (
              <BetPlacementWidget compact={!!currentBets} />
            )}

            {/* {isReady && isConnected && <HistoricalBetPanel />} */}

            <div className="stream-chat-container">
              <TwitchChat channel={twitchChannel} width="100%" height="100%" />
            </div>
          </div>
        </div>
      </div>

      <div className="right-sidebar">
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
