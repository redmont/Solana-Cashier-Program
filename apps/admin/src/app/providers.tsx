'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import axios, { ResponseType } from 'axios';
import {
  AuthModeType,
  DynamicContextProvider,
  DynamicWidget,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { createConfig, WagmiProvider, useAccount } from 'wagmi';
import { http } from 'viem';
import { mainnet } from 'viem/chains';
import theme from '@/theme';
import { baseUrl } from '@/config';

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey: [url, responseType] }) => {
        if (typeof url === 'string') {
          const { data } = await axios.get(`${baseUrl}/${url.toLowerCase()}`, {
            responseType: (responseType as ResponseType) ?? undefined,
          });

          if (responseType === 'blob') {
            return new Blob([data]);
          }

          return data;
        }
        throw new Error('Invalid QueryKey');
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '21452bd4-902f-40be-9b8f-5bc817b00e0e',
        walletConnectors: [EthereumWalletConnectors],
        initialAuthenticationMode: 'connect-only',
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <ChakraProvider theme={theme}>{children}</ChakraProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
