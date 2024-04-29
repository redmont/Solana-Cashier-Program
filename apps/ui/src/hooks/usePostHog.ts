import { usePostHog as usePH } from 'posthog-js/react';
import { useEthWallet } from '@/providers/EthWalletProvider';

export function usePostHog() {
  const { address, isConnected } = useEthWallet();
  const posthog = usePH();

  if (isConnected && address) {
    posthog?.identify(address.toLowerCase());
  } else {
    posthog?.reset();
  }

  return posthog;
}
