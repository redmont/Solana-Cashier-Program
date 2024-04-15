'use client';

import { useAppState } from '@/components/AppStateProvider';
import { EthConnectButton, useEthWallet } from '@/components/web3';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { MyBetPanel } from '@/components/myBetPanel/MyBetPanel';
import { HistoricalBetPanel } from '@/components/historicalBetPanel';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

  const {} = useAppState();

  return (
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

        {isReady && isConnected && <BetPlacementWidget />}
        {/* {isReady && isConnected && <MyBetPanel />} */}
        {/* {isReady && isConnected && <HistoricalBetPanel />} */}
      </div>
    </div>
  );
}
