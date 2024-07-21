'use client';

import { FC, useCallback } from 'react';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { truncateEthAddress } from '@/utils';
import { useEthWallet } from '@/hooks';

export interface EthConnectButtonProps {
  className?: string;
  size?: 'small' | 'large';
}

export const JoinButton: FC<EthConnectButtonProps> = ({ ...props }) => {
  const { setShowAuthFlow, setShowDynamicUserProfile, user } =
    useDynamicContext();
  const { isConnected, address } = useEthWallet();

  // Seems like isAuthenticated is set straight after page load
  // but wallet address is not. Needs to be polished.
  const walletAddress = truncateEthAddress(address ?? '');

  const handleClick = useCallback(() => {
    isConnected ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isConnected, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <Button
      size={props.size}
      type="button"
      label={isConnected ? user?.username ?? walletAddress : 'Join the Fight'}
      className={classNames(props.className, 'font-normal', {
        'px-4 py-3': props.size === 'large',
        'px-4 py-2': !props.size,
      })}
      onClick={handleClick}
    />
  );
};

export const MobileJoinButton: FC<EthConnectButtonProps> = (props) => {
  const { isConnected } = useEthWallet();

  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();

  const handleClick = useCallback(() => {
    isConnected ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isConnected, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <Button
      type="button"
      icon="pi pi-wallet"
      rounded
      size="large"
      className={classNames(props.className, 'p-4')}
      onClick={handleClick}
    />
  );
};
