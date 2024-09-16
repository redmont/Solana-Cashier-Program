import {
  useDynamicContext,
  useSwitchNetwork,
  useSwitchWallet,
  useUserWallets,
  useDynamicModals,
} from '@dynamic-labs/sdk-react-core';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import networks, { getNetworkType, networkIdExists } from '@/config/networks';
import { isDev } from '@/config/env';

export function useWallet() {
  const switchNetwork = useSwitchNetwork();
  const switchWallet = useSwitchWallet();
  const { setShowLinkNewWalletModal } = useDynamicModals();
  const { authToken, isAuthenticated, primaryWallet, user } =
    useDynamicContext();
  const { toast } = useToast();
  const isConnected = primaryWallet?.connected || false;
  const address = primaryWallet?.address as `0x${string}` | undefined;
  const userWallets = useUserWallets();

  const networkId = useQuery({
    queryKey: ['network', primaryWallet?.id],
    enabled: !!primaryWallet,
    queryFn: () => primaryWallet?.connector!.getNetwork(),
  });

  const network = useMemo(() => {
    if (networkId.data) {
      return networks.find((chain) => chain.id === networkId.data);
    }
  }, [networkId.data]);

  const switchNetworkMutation = useMutation({
    mutationFn: async (id: string | number) => {
      if (!primaryWallet) {
        throw new Error('Primary wallet not found');
      }
      if (!networkIdExists(id)) {
        throw new Error(`Network ${id} not found`);
      }

      const chainType = getNetworkType(id);
      const wallet = userWallets.find((wallet) => wallet.chain === chainType);

      if (!wallet) {
        // Wallet not found, initialize the process for linking a new wallet
        setShowLinkNewWalletModal(true);
        return;
      }

      if (wallet.id !== primaryWallet.id) {
        await switchWallet(wallet.id);
      }

      await switchNetwork({
        wallet,
        network: id,
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to switch network',
        description: isDev ? err.message : 'Please try again later.',
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
    primaryWallet,
    user,
    switchNetwork: switchNetworkMutation,
  };
}
