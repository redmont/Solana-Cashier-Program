import { isDev } from '../env';

export const solanaMainnet = {
  name: 'Solana',
  id: 'mainnet',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: { http: ['https://nelia-u3mx5a-fast-mainnet.helius-rpc.com'] },
  },
  blockExplorers: {
    default: { name: 'Solana Explorer', url: 'https://explorer.solana.com' },
  },
  testnet: false,
} as const;

export const solanaDevnet = {
  name: 'Solana Devnet',
  id: 'devnet',
  nativeCurrency: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
  },
  rpcUrls: {
    default: { http: ['https://jackelyn-ge6zp0-fast-devnet.helius-rpc.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Solana Explorer',
      url: 'https://explorer.solana.com/?cluster=devnet',
    },
  },
  testnet: true,
} as const;

export default isDev ? solanaDevnet : solanaMainnet;
