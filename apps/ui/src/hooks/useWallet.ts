'use client';

import { useAccount } from 'wagmi';
import {
  useDynamicContext,
  useSwitchNetwork,
  useSwitchWallet,
  useUserWallets,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import networks, { ChainProtocols } from '@/config/chains';

export function useWallet() {
  const { isConnected, address } = useAccount();
  const { authToken, isAuthenticated, primaryWallet, user, handleLogOut } =
    useDynamicContext();
  const switchNetwork = useSwitchNetwork();
  const switchWallet = useSwitchWallet();
  const { setShowLinkNewWalletModal } = useDynamicModals();

  const [primaryWalletNetwork, setPrimaryWalletNetwork] = useState<
    string | number | undefined
  >(undefined);

  const { toast } = useToast();
  const userWallets = useUserWallets();
  const wallet = primaryWallet?.connector;

  const currentNetworks = useMemo(() => {
    return [
      ...networks[ChainProtocols.eip155],
      ...networks[ChainProtocols.solana],
    ];
  }, [primaryWallet?.chain]);

  const networkId = useQuery({
    queryKey: ['network'],
    enabled: !!primaryWallet,
    queryFn: async () => {
      return wallet!.getNetwork();
    },
  });

  const network = useMemo(() => {
    if (networkId.data && primaryWallet?.chain) {
      return currentNetworks?.find((chain) => {
        if ('cluster' in chain) {
          return chain.cluster === networkId.data;
        }
        return chain.id === networkId.data;
      });
    }
  }, [networkId.data, networks]);

  useEffect(() => {
    (async () => {
      if (
        !primaryWallet ||
        !primaryWalletNetwork ||
        primaryWalletNetwork === 'solana'
      ) {
        return;
      }
      await switchNetwork({
        wallet: primaryWallet,
        network: primaryWalletNetwork,
      });
      networkId.refetch();
    })();
  }, [primaryWallet?.id]);

  const switchNetworkMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!primaryWallet) {
        return;
      }
      const network = currentNetworks.find((chain) => chain.id === id);
      if (!network) {
        return;
      }
      const chain = 'chain' in network ? network.chain : ChainProtocols.eip155;
      const wallet = userWallets.find((obj) => obj.chain === chain);

      if (!wallet) {
        // Wallet not found, initialize the process for linking a new wallet
        setShowLinkNewWalletModal(true);
        return;
      }

      setPrimaryWalletNetwork(network.id);
      if (wallet?.id === primaryWallet?.id) {
        await switchNetwork({
          wallet: primaryWallet,
          network: network.id,
        });
        return;
      }
      await switchWallet(wallet?.id);
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
    switchChainAndNetwork: switchNetworkMutation,
    currentNetworks,
    walletKey: primaryWallet?.connector.key,
    switchNetwork: switchNetworkMutation,
  };
}
