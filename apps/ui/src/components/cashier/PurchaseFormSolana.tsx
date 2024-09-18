import { FC, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Program, BN, AnchorProvider } from '@project-serum/anchor';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { ISolana } from '@dynamic-labs/solana';
import { Button } from '../ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PricedCredits } from './utils';

import { useUSDCBalance, TOKEN_DECIMALS, connection } from './utilsSolana';
import { useContracts } from '@/hooks/useContracts';
import { useMutation } from '@tanstack/react-query';
import { usePostHog } from '@/hooks';
import { useAtomValue } from 'jotai';
import { balanceAtom, userIdAtom } from '@/store/account';

export const PurchaseFormSolana: FC<{
  credits: PricedCredits;
  onPurchaseCompleted?: () => void;
  onClose?: () => void;
}> = ({ credits, onPurchaseCompleted }) => {
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();
  const contracts = useContracts();
  const posthog = usePostHog();
  const balance = useAtomValue(balanceAtom);
  const userId = useAtomValue(userIdAtom);

  const { usdcTokenAccount: userTokenAccount } = useUSDCBalance();

  if (
    !primaryWallet ||
    contracts.isSuccess === false ||
    contracts.type !== 'solana'
  ) {
    throw new Error('A Solana Wallet not connected');
  }

  const keys = useMemo(
    () => ({
      wallet: new PublicKey(primaryWallet.address),
      program: new PublicKey(contracts.depositor.address),
      state: new PublicKey(contracts.depositor.programState),
    }),
    [primaryWallet.address, contracts.depositor],
  );

  const provider = useMemo(
    () =>
      new AnchorProvider(
        connection,
        {
          publicKey: keys.wallet,
          signTransaction: async (transaction) => {
            const signer = await primaryWallet.connector.getSigner<ISolana>();
            return await signer.signTransaction(transaction);
          },
          signAllTransactions: async (transactions) => {
            const signer = await primaryWallet.connector.getSigner<ISolana>();
            return await signer.signAllTransactions(transactions);
          },
        },
        { commitment: 'confirmed' },
      ),
    [primaryWallet.connector, keys.wallet],
  );

  const program = useMemo(
    () => new Program(contracts.depositor.idl, keys.program, provider),
    [contracts.depositor.idl, keys.program, provider],
  );

  const handlePurchase = useMutation({
    mutationFn: async () => {
      if (!userTokenAccount) {
        throw new Error('User token account not found');
      }

      const state = await program.account.state.fetch(keys.state);
      const treasuryTokenAccount: PublicKey = state.treasury as PublicKey;

      const decimals = TOKEN_DECIMALS;
      const amountInLamports = credits.amount * Math.pow(10, decimals);

      if (!userId) {
        throw new Error('');
      }
      const bytesUserId = Buffer.from(userId, 'utf-8');

      await program.methods
        .depositAndSwap(new BN(amountInLamports), bytesUserId)
        .accounts({
          state: keys.state,
          userTokenAccount,
          treasury: treasuryTokenAccount,
          userAuthority: keys.wallet,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([])
        .rpc();
    },
    onError: () => {
      toast({
        title: 'Purchase failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      onPurchaseCompleted?.();
      toast({
        title: 'Purchase completed',
        description: `${credits.credits} credits purchased.`,
        variant: 'default',
      });
      posthog?.capture('Credits Purchased', {
        credits: credits.credits,
        cost: credits.amount,
        prevCreditBalance: balance,
      });
    },
  });

  return (
    <div>
      <h4 className="mb-4 text-lg font-bold">Cash In</h4>
      <p className="mb-3 font-normal">
        You are about to cash in <b>${credits.amount}</b> on the <b>Solana</b>{' '}
        chain.
      </p>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-normal">
            Complete your purchase by sending USDC (gas fees may apply).
          </p>
        </div>
        <Button
          loading={handlePurchase.isPending}
          onClick={() => handlePurchase.mutate()}
          disabled={handlePurchase.isPending}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};
