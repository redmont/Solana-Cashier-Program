import { FC } from 'react';
import { JoinButton } from '@/components/JoinButton';

export const ConnectWalletWidget: FC = () => {
  return (
    <div className="widget connect-wallet-widget">
      <div className="widget-body framed">
        <JoinButton size="large" />
      </div>
    </div>
  );
};
