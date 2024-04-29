'use client';

import React, {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { createConfig, WagmiProvider, useAccount } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig, ConnectKitProvider } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ChildContainerProps } from '@/types';
import { walletConnectProjectId } from '@/config';

import connectKitTheme from '@/styles/connectKitTheme.json';

const queryClient = new QueryClient();

export const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId,
    chains: [mainnet],
    appName: 'Brawlers',
    ssr: true,
  }),
);

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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark" customTheme={connectKitTheme}>
          <EthWalletReadinessProvider>{children}</EthWalletReadinessProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
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
