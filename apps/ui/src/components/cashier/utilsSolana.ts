import { PublicKey, Connection } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';

import { useQuery } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useContracts } from '@/hooks/useContracts';
import solanaConfig from '@/config/networks/solana';

export const connection = new Connection(solanaConfig.rpcUrls.default.http[0], {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 50000,
});

export const TOKEN_DECIMALS = 6;

export const fetchTokenBalance = async (
  walletAddress: string,
  tokenAddress: string,
): Promise<{ usdcTokenAccount: PublicKey | null; usdcBalance: bigint }> => {
  const walletPublicKey = new PublicKey(walletAddress);

  const usdcTokenAccount = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    walletPublicKey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const { amount: usdcBalance } = await getAccount(
    connection,
    usdcTokenAccount,
  );

  return { usdcTokenAccount, usdcBalance };
};

export const useUSDCBalance = () => {
  const { primaryWallet } = useDynamicContext();
  const contracts = useContracts();

  const {
    data,
    error,
    isLoading,
    status,
    refetch: loadUSDCBalance,
  } = useQuery({
    queryKey: [
      'usdcBalance',
      primaryWallet?.address,
      contracts.depositor?.address,
    ],
    queryFn: () =>
      fetchTokenBalance(
        primaryWallet?.address ?? '',
        contracts.depositor!.parameters.allowedTokenAddress,
      ),
    enabled:
      !!primaryWallet?.address &&
      primaryWallet?.chain === 'solana' &&
      !!contracts.depositor,
  });

  const balance = data?.usdcBalance ?? BigInt(0);
  const usdcTokenAccount = data?.usdcTokenAccount ?? null;

  return {
    balance,
    loading: isLoading,
    status,
    error,
    loadUSDCBalance,
    usdcTokenAccount,
  };
};
