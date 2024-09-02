import { useAccount } from 'wagmi';
import {
  useDynamicContext,
  useSwitchNetwork,
} from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as chains from 'viem/chains';
import { useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useWallet() {
  const { isConnected, address } = useAccount();
  const { authToken, isAuthenticated, walletConnector, primaryWallet } =
    useDynamicContext();
  const switchNetwork = useSwitchNetwork();
  const { toast } = useToast();

  const networkId = useQuery({
    queryKey: ['network'],
    enabled: !!walletConnector,
    queryFn: async () => {
      return walletConnector!.getNetwork();
    },
  });

  const network = useMemo(
    () =>
      networkId.data !== undefined
        ? Object.values(chains).find((chain) => chain.id === networkId.data)
        : undefined,
    [networkId.data],
  );

  const switchNetworkMutation = useMutation({
    mutationFn: async (networkId: number) => {
      if (primaryWallet) {
        await switchNetwork({ wallet: primaryWallet, network: networkId });
      }
    },
    onError: () => {
      toast({
        title: 'Failed to switch network',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      networkId.refetch();
    },
  });

  return {
    isConnected,
    address,
    authToken,
    isAuthenticated,
    networkId,
    network,
    switchNetwork: switchNetworkMutation,
  };
}
