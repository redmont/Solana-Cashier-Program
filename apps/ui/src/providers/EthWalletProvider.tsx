'use client';

import React, { FC } from 'react';
import { http } from 'viem';
import { createConfig, WagmiProvider, useAccount } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DynamicContextProvider,
  DynamicUserProfile,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { usePostHog } from 'posthog-js/react';

import { ChildContainerProps } from '@/types';
import { dynamicWalletEnvironmentId } from '@/config';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export const EthWalletProvider: FC<ChildContainerProps> = ({ children }) => {
  const posthog = usePostHog();

  return (
    <DynamicContextProvider
      settings={{
        environmentId: dynamicWalletEnvironmentId,
        walletConnectors: [EthereumWalletConnectors],
        events: {
          onLogout: () => {
            posthog.reset();
          },
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
            <DynamicUserProfile />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};

export function useEthWallet() {
  const { isConnected, address } = useAccount();
  const { authToken, isAuthenticated } = useDynamicContext();

  return {
    isConnected,
    address,
    authToken,
    isAuthenticated,
  };
}
