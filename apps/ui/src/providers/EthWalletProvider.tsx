'use client';

import React, { FC } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DynamicContextProvider,
  DynamicUserProfile,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { usePostHog } from 'posthog-js/react';

import { ChildContainerProps } from '@/types';
import { dynamicWalletEnvironmentId } from '@/config/env';

import config from '@/config/wagmi';

const queryClient = new QueryClient();

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
      <WagmiProvider config={config}>
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
