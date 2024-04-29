import { FC } from 'react';
import { EthConnectButton } from '../EthConnectButton';

export const ConnectWalletWidget: FC = () => {
  return (
    <div className="widget connect-wallet-widget">
      <div className="widget-body framed">
        <EthConnectButton size="large" />
      </div>
    </div>
  );
};
