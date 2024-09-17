import { useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useWallet } from '@/hooks';

export const useDynamicAuthClickHandler = () => {
  const { setShowAuthFlow, setShowDynamicUserProfile } = useDynamicContext();
  const { isAuthenticated } = useWallet();

  return useCallback(() => {
    isAuthenticated ? setShowDynamicUserProfile(true) : setShowAuthFlow(true);
  }, [isAuthenticated, setShowAuthFlow, setShowDynamicUserProfile]);
};
