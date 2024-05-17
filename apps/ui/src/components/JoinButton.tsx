'use client';

import { FC, useCallback } from 'react';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { truncateEthAddress } from '@/utils';

export interface EthConnectButtonProps {
  className?: string;
  size?: 'small' | 'large';
}

export const JoinButton: FC<EthConnectButtonProps> = ({ ...props }) => {
  const {
    isAuthenticated,
    primaryWallet,
    setShowAuthFlow,
    setShowDynamicUserProfile,
  } = useDynamicContext();

  // Seems like isAuthenticated is set straight after page load
  // but wallet address is not. Needs to be polished.
  const walletAddress = truncateEthAddress(primaryWallet?.address ?? '');

  const handleClick = useCallback(() => {
    isAuthenticated ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <Button
      size={props.size}
      type="button"
      label={isAuthenticated ? walletAddress : 'Join Now'}
      className={classNames(props.className, 'font-normal', {
        'px-4 py-3': props.size === 'large',
        'px-4 py-2': !props.size,
      })}
      onClick={handleClick}
    />
  );
};

export const MobileJoinButton: FC<EthConnectButtonProps> = (props) => {
  const { isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile } =
    useDynamicContext();

  const handleClick = useCallback(() => {
    isAuthenticated ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);

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
