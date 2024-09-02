'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { truncateEthAddress } from '@/utils';
import { useWallet } from '@/hooks';
import { Button } from './ui/button';

export interface EthConnectButtonProps {
  className?: string;
}

const defaultText = 'Join the Fight';

export const JoinButton: FC<EthConnectButtonProps> = ({ className }) => {
  const { setShowAuthFlow, setShowDynamicUserProfile, user } =
    useDynamicContext();
  const { isAuthenticated, address } = useWallet();
  const [buttonText, setButtonText] = useState<string>(defaultText);

  const walletAddress = truncateEthAddress(address ?? '');

  useEffect(() => {
    setButtonText(
      isAuthenticated ? (user?.username ?? walletAddress) : defaultText,
    );
  }, [isAuthenticated, user, walletAddress]);

  const handleClick = useCallback(() => {
    isAuthenticated ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);

  return (
    <Button className={className} variant="outline" onClick={handleClick}>
      {buttonText}
    </Button>
  );
};
