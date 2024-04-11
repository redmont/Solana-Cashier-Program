import { EthConnectButton } from '@/components/web3';

export default function Home() {
  return (
    <div className="main-page">
      <div className="match-stream-container">
        <img className="stream-placeholder" src="/match.png" />
      </div>
      <div className="match-betting-panel">
        <EthConnectButton size="large" />
      </div>
    </div>
  );
}
