'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import axios, { ResponseType } from 'axios';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { createConfig, WagmiProvider } from 'wagmi';
import { http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import theme from '@/theme';
import { baseUrl } from '@/config';
import DynamicWrapper from '@/components/DynamicWrapper';

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
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
    <DynamicWrapper>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <ChakraProvider theme={theme}>{children}</ChakraProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicWrapper>
  );
}
