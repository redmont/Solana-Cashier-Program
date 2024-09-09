import { Environment } from '@/types';
import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import * as chains from './chains';

export const development = createConfig({
  chains: chains.development,
  multiInjectedProviderDiscovery: false,
  transports: {
    [chains.sepolia.id]: http(),
    [chains.polygonAmoy.id]: http(),
  },
});

export const preview = createConfig({
  chains: chains.preview,
  multiInjectedProviderDiscovery: false,
  transports: {
    [chains.sepolia.id]: http(),
    [chains.polygonAmoy.id]: http(),
  },
});

export const production = createConfig({
  chains: chains.production,
  multiInjectedProviderDiscovery: false,
  transports: {
    [101]: http(),
    [mainnet.id]: http(),
    [chains.polygon.id]: http(),
  },
});

const wagmiConfigs: Record<Environment, ReturnType<typeof createConfig>> = {
  production,
  preview,
  development,
};

export default wagmiConfigs[
  process.env.NEXT_PUBLIC_VERCEL_ENV as Environment
] ?? development;
