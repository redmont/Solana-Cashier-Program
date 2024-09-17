import { Environment } from '@/types';
import { createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import * as chains from './networks';

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const getAlchemyTransport = (alchemyChainId: string) =>
  http(`https://${alchemyChainId}.g.alchemy.com/v2/${alchemyApiKey}`);

const testnetTransports = {
  [chains.sepolia.id]: getAlchemyTransport('eth-sepolia'),
  [chains.polygonAmoy.id]: getAlchemyTransport('polygon-amoy'),
};

export const development = createConfig({
  chains: [chains.sepolia, chains.polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: {
    ...testnetTransports,
  },
});

export const preview = createConfig({
  chains: [chains.sepolia, chains.polygonAmoy],
  multiInjectedProviderDiscovery: false,
  transports: {
    ...testnetTransports,
  },
});

export const production = createConfig({
  chains: [chains.mainnet, chains.polygon],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: getAlchemyTransport('eth-mainnet'),
    [chains.polygon.id]: getAlchemyTransport('polygon-mainnet'),
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
