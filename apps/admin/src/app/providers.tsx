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
import { ReactNode } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const config = createConfig({
  chains: [mainnet, sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const { authToken } = useDynamicContext();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: async ({ queryKey: [url, responseType] }) => {
          if (typeof url === 'string') {
            const { data } = await axios.get(
              `${baseUrl}/${url.toLowerCase()}`,
              {
                headers: authToken
                  ? { Authorization: `Bearer ${authToken}` }
                  : undefined,
                responseType: (responseType as ResponseType) ?? undefined,
              },
            );

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

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DynamicWrapper>
      <WagmiProvider config={config}>
        <QueryProvider>
          <DynamicWagmiConnector>
            <ChakraProvider theme={theme}>{children}</ChakraProvider>
          </DynamicWagmiConnector>
        </QueryProvider>
      </WagmiProvider>
    </DynamicWrapper>
  );
}
