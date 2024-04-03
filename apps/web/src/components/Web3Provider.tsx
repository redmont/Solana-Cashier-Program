import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, polygonAmoy, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ALCHEMY_API_KEY, WALLETCONNECT_PROJECT_ID } from "../config";
import { ReactNode } from "react";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [mainnet, sepolia, polygon, polygonAmoy],
    transports: {
      // RPC URL for each chain
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      ),
      [sepolia.id]: http(
        `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      ),
      [polygon.id]: http(
        `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      ),
      [polygonAmoy.id]: http(
        `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
      ),
    },

    // Required API Keys
    walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    ssr: true,

    // Required App Info
    appName: "Brawlers",

    // Optional App Info
    appDescription: "Brawlers",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
