'use client';

import { useAccount } from 'wagmi';
import {
  useDynamicContext,
  useSwitchNetwork,
} from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ChainId, default as chains } from '@/config/chains';

export function useWallet() {
  const { isConnected, address } = useAccount();
  const {
    authToken,
    isAuthenticated,
    walletConnector,
    primaryWallet,
    user,
    handleLogOut,
  } = useDynamicContext();
  const switchNetwork = useSwitchNetwork();
  const { toast } = useToast();

  const networkId = useQuery({
    queryKey: ['network'],
    enabled: !!walletConnector,
    queryFn: async () => {
      const current = await walletConnector!.getNetwork();
      if (!chains.find((n) => n.id === current)) {
        throw Error('Invalid network selected');
      }
      return walletConnector!.getNetwork() as Promise<ChainId>;
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
    logout: handleLogOut,
    user,
    isConnected,
    address,
    authToken,
    isAuthenticated,
    networkId,
    network,
    walletKey: primaryWallet?.connector.key,
    switchNetwork: switchNetworkMutation,
  };
}
