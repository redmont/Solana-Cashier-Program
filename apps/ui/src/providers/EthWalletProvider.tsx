'use client';

import React, {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
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
import { dynamicWalletEnvironmentId } from '@/config';

import { getCurrentAuthToken } from './AuthProvider';

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
  const isAuthenticated = !!getCurrentAuthToken();
  const [isReady, setReady] = useState<boolean>(false);

  const { isConnecting, isConnected } = account;

  // 0: Initialisation
  // 1: Waiting connection start
  // 2: Connecting
  const phase = useRef(0);

  // This use effect prevents UI from "jumping"
  // i.e. showing intermediate states before wallet connects
  // because it takes few loops to solicit final wallet connection state
  useEffect(() => {
    // If not authenticated with Dynamic it is not connected
    if (!isAuthenticated) {
      setReady(true);
    }

    // If authenticated but no sign of previous connection
    // then wait until connection starts
    if (
      isAuthenticated &&
      phase.current === 0 &&
      !isConnecting &&
      !isConnecting
    ) {
      phase.current = 1;
    }

    // If isConnecting or isConnection are appeared as true
    // then wait until they are reset
    if (phase.current === 0 && (isConnecting || isConnected)) {
      phase.current = 1;
      return;
    }

    // Move to the Connecting phase
    if (phase.current === 1 && isConnecting) {
      phase.current = 2;
      return;
    }

    // Once connecting goes from true to false
    // we assume it is ready
    if (phase.current === 2 && !isConnecting) {
      setReady(true);
    }
  }, [isAuthenticated, isConnected, isConnecting]);

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
        environmentId: dynamicWalletEnvironmentId,
        walletConnectors: [EthereumWalletConnectors],
        initialAuthenticationMode: 'connect-only',
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
