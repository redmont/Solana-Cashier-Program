import { usePostHog as usePH } from 'posthog-js/react';
import { useEthWallet } from '@/hooks';

export function usePostHog() {
  const { address: walletAddress, isConnected } = useEthWallet();
  const posthog = usePH();

  if (isConnected && walletAddress) {
    posthog?.identify(walletAddress.toLowerCase());
  } else {
    posthog?.reset();
  }

  return posthog;
}
