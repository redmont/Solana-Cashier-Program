import { usePostHog as usePH } from 'posthog-js/react';
import { useWallet } from '@/hooks';

export function usePostHog() {
  const { address: walletAddress, isAuthenticated } = useWallet();
  const posthog = usePH();

  if (isAuthenticated && walletAddress) {
    posthog?.identify(walletAddress.toLowerCase());
  }

  return posthog;
}
