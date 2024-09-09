import { Environment } from '@/types';
import { Chain } from 'viem';
import { mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains';
import {
  solanaMainnet,
  solanaDevnet,
  ExtendedTypeSolanaDefineChain,
} from './solanaChains';

export * from 'viem/chains';

export enum ChainProtocols {
  eip155 = 'eip155',
  solana = 'solana',
}
export type SupportedChains = ChainProtocols.eip155 | ChainProtocols.solana;
export type ChainList = Chain[] | ExtendedTypeSolanaDefineChain[];

export const production = [mainnet, polygon, solanaMainnet] as const;
export const development = [sepolia, polygonAmoy, solanaDevnet] as const;
export const preview = development;

type Chains = {
  [key in string]: {
    [key in SupportedChains]: ChainList;
  };
};

const chains: Chains = {
  production: { solana: [solanaMainnet], eip155: [mainnet, polygon] },
  development: { solana: [solanaDevnet], eip155: [sepolia, polygonAmoy] },
  preview: { solana: [solanaDevnet], eip155: [sepolia, polygonAmoy] },
};

export default chains[process.env.NEXT_PUBLIC_VERCEL_ENV as Environment] ??
  chains.development;

export type ChainId =
  | typeof sepolia.id
  | typeof mainnet.id
  | typeof polygonAmoy.id
  | typeof polygon.id;
