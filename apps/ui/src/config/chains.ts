import { Environment } from '@/types';
import { mainnet, polygon, polygonAmoy, sepolia } from 'viem/chains';

export * from 'viem/chains';

export const production = [mainnet, polygon] as const;

export const development = [sepolia, polygonAmoy] as const;

export const preview = development;

const chains = {
  production,
  development,
  preview,
} as const satisfies Record<Environment, unknown>;

export default chains[process.env.NEXT_PUBLIC_VERCEL_ENV as Environment] ??
  development;
