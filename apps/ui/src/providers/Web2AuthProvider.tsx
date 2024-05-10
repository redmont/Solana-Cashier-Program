import { FC, PropsWithChildren } from 'react';
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import {
  DynamicContextProvider,
  DynamicUserProfile,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const Web2AuthProvider: FC<PropsWithChildren> = ({ children }) => (
  <DynamicContextProvider
    settings={{
      environmentId: '866dfa15-a3f8-4f9a-bcb0-493e6ad952f2',
      walletConnectors: [EthereumWalletConnectors],
      initialAuthenticationMode: 'connect-only',
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

export default Web2AuthProvider;
