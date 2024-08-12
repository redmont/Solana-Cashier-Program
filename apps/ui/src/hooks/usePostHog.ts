import { usePostHog as usePH } from 'posthog-js/react';
import { useEthWallet } from '@/hooks';

export function usePostHog() {
  const { address: walletAddress, isAuthenticated } = useEthWallet();
  const posthog = usePH();

  if (isAuthenticated && walletAddress) {
    posthog?.identify(walletAddress.toLowerCase());
  }

  return posthog;
}
