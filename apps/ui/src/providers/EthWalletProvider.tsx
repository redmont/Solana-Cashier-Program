'use client';

import React, {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { http } from 'viem';
import { createConfig, WagmiProvider, useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DynamicContextProvider,
  DynamicUserProfile,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';

import { ChildContainerProps } from '@/types';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const EthWalletReadinessConext = createContext<{ isReady: boolean }>({
  isReady: false,
});

const EthWalletReadinessProvider: FC<ChildContainerProps> = ({ children }) => {
  const account = useAccount();
  const [isReady, setReady] = useState<boolean | null>(null);

  const { isConnecting, isConnected } = account;

  // This use effect prevents UI from "jumping"
  // i.e. showing intermediate states before wallet connects
  // because it takes few loops to solicit final wallet connection state
  useEffect(() => {
    if (isReady) return;

    if (isConnecting) setReady(false);

    if ((!isConnecting && isReady === false) || isConnected) setReady(true);
  }, [isReady, isConnected, isConnecting]);

  return (
    <EthWalletReadinessConext.Provider value={{ isReady: isReady ?? false }}>
      {children}
    </EthWalletReadinessConext.Provider>
  );
};

export const EthWalletProvider: FC<ChildContainerProps> = ({ children }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: '21452bd4-902f-40be-9b8f-5bc817b00e0e',
        walletConnectors: [EthereumWalletConnectors],
        // initialAuthenticationMode: 'connect-only',
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <EthWalletReadinessProvider>
              {children}
              <DynamicUserProfile />
            </EthWalletReadinessProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};

export function useEthWallet() {
  const account = useAccount();
  const { isReady } = useContext(EthWalletReadinessConext);

  return {
    ...account,
    isReady,
  };
}
