'use client';

import { EthConnectButton, useEthWallet } from '@/components/web3';
import { BetInputPanel } from '@/components/betPlacementPanel';

export default function Home() {
  const { isReady, isConnected } = useEthWallet();

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

        {isReady && isConnected && <BetInputPanel />}
      </div>
    </div>
  );
}
