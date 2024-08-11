'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { truncateEthAddress } from '@/utils';
import { useEthWallet } from '@/hooks';

export interface EthConnectButtonProps {
  className?: string;
  size?: 'small' | 'large';
}

const defaultText = 'Join the Fight';

export const JoinButton: FC<EthConnectButtonProps> = ({ ...props }) => {
  const { setShowAuthFlow, setShowDynamicUserProfile, user } =
    useDynamicContext();
  const { isAuthenticated, address } = useEthWallet();
  const [buttonText, setButtonText] = useState<string>(defaultText);

  // TODO
  // Seems like isAuthenticated is set straight after page load
  // but wallet address is not. Needs to be polished.

  const walletAddress = truncateEthAddress(address ?? '');

  // TODO
  // User auth is client side, leading to hydration issues
  // Authentication should also be server-side if we want to use app router
  useEffect(() => {
    setButtonText(
      isAuthenticated ? (user?.username ?? walletAddress) : defaultText,
    );
  }, [isAuthenticated, user, walletAddress]);

  const handleClick = useCallback(() => {
    isAuthenticated ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <Button
      size={props.size}
      type="button"
      label={buttonText}
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
      size="large"
      className={classNames(props.className)}
      onClick={handleClick}
    />
  );
};
