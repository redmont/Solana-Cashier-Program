import { PublicKey, Connection } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token';

import { useQuery } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { solanaUsdcMintAddress, solanaRpcEndpoint } from '@/config/env';

const connection = new Connection(solanaRpcEndpoint, {
  commitment: 'confirmed',
});

export const TOKEN_DECIMALS = 6;

export const fetchUSDCBalance = async (
  walletAddress: string,
): Promise<{ usdcTokenAccount: PublicKey | null; usdcBalance: bigint }> => {
  try {
    const walletPublicKey = new PublicKey(walletAddress);

    const usdcTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(solanaUsdcMintAddress),
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
  } catch (error) {
    return { usdcTokenAccount: null, usdcBalance: BigInt(0) };
  }
};

export const useUSDCBalance = () => {
  const { primaryWallet } = useDynamicContext();

  const {
    data,
    error,
    isLoading,
    status,
    refetch: loadUSDCBalance,
  } = useQuery({
    queryKey: ['usdcBalance', primaryWallet?.address],
    queryFn: () => fetchUSDCBalance(primaryWallet?.address ?? ''),
    enabled: !!primaryWallet?.address && primaryWallet?.chain === 'solana',
    retry: false, // disable retry to handle errors manually
    refetchOnWindowFocus: false, // avoid unnecessary refetching
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
