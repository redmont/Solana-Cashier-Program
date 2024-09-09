import { solanaRpcEndpoint } from '@/config/env';
import { Chain } from 'viem';

export type ExtendedTypeSolanaDefineChain = Chain & {
  cluster: string;
  chain: string;
};

export const solanaMainnet: ExtendedTypeSolanaDefineChain = {
  name: 'Solana',
  chain: 'solana',
  id: 101,
  cluster: 'mainnet',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: { http: [solanaRpcEndpoint] },
  },
  blockExplorers: {
    default: { name: 'Solana Explorer', url: 'https://explorer.solana.com' },
  },
  testnet: false,
};

export const solanaDevnet: ExtendedTypeSolanaDefineChain = {
  name: 'Solana Devnet',
  chain: 'solana',
  id: 103,
  cluster: 'devnet',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: { http: [solanaRpcEndpoint] },
  },
  blockExplorers: {
    default: { name: 'Solana Explorer', url: 'https://explorer.solana.com' },
  },
  testnet: true,
};
