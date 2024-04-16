'use client';

import { useAppState } from '@/components/AppStateProvider';
import { EthConnectButton, useEthWallet } from '@/components/web3';
import { BetPlacementWidget } from '@/components/betPlacementWidget';
import { CurrentBetWidget } from '@/components/currentBetWidget';
import { HistoricalBetPanel } from '@/components/historicalBetPanel';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

  const { currentBets } = useAppState();

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

        {isReady && isConnected && currentBets && <CurrentBetWidget />}

        {isReady && isConnected && (
          <BetPlacementWidget compact={!!currentBets} />
        )}
        {/* {isReady && isConnected && <HistoricalBetPanel />} */}
      </div>
    </div>
  );
}
