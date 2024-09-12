import { FC, useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { IDL } from './solanaProgramIdl/solana_cashier';
import { Program, Idl, BN, AnchorProvider } from '@project-serum/anchor';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { ISolana } from '@dynamic-labs/solana';
import { Button } from '../ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PricedCredits } from './utils';
import { useAtomValue } from 'jotai';
import { userIdAtom } from '@/store/account';
import {
  solanaProgramStateAddress,
  solanaCashierContractID,
  solanaRpcEndpoint,
} from '@/config/env';

import { useUSDCBalance, TOKEN_DECIMALS } from './utilsSolana';

const connection = new Connection(solanaRpcEndpoint, {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 50000,
});

export const PurchaseFormSolana: FC<{
  credits: PricedCredits;
  onPurchaseCompleted?: () => void;
  onClose?: () => void;
}> = ({ credits, onPurchaseCompleted }) => {
  const { toast } = useToast();
  const userId = useAtomValue(userIdAtom);
  const { primaryWallet } = useDynamicContext();
  const [isPending, setIsPending] = useState(false);

  const { usdcTokenAccount: userUsdcTokenAccount, loadUSDCBalance } =
    useUSDCBalance();

  useEffect(() => {
    loadUSDCBalance;
  }, [loadUSDCBalance, primaryWallet?.address]);

  if (!primaryWallet) {
    return null;
  }

  const programId = new PublicKey(solanaCashierContractID);
  const statePubkey = new PublicKey(solanaProgramStateAddress);

  const walletPublicKey = new PublicKey(primaryWallet.address);

  const provider = new AnchorProvider(
    connection,
    {
      publicKey: walletPublicKey,
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
  );
  const program = new Program(IDL as Idl, programId, provider);

  const handlePurchase = async () => {
    if (!primaryWallet) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your Solana wallet to proceed.',
        variant: 'destructive',
      });
      return;
    }

    setIsPending(true);

    try {
      const userTokenAccount = userUsdcTokenAccount;

      if (!userTokenAccount) {
        throw new Error('User token account not found');
      }

      const state = await program.account.state.fetch(statePubkey);
      const treasuryTokenAccount: PublicKey = state.treasury as PublicKey;

      const decimals = TOKEN_DECIMALS;
      const amountInLamports = credits.total * Math.pow(10, decimals);
      if (!userId) {
        throw new Error('');
      }
      const bytesUserId = Buffer.from(userId, 'utf-8');

      await program.methods
        .depositAndSwap(new BN(amountInLamports), bytesUserId)
        .accounts({
          state: statePubkey,
          userTokenAccount: userTokenAccount,
          treasury: treasuryTokenAccount,
          userAuthority: walletPublicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([])
        .rpc();

      // Notify success
      toast({
        title: 'Purchase completed',
        description: `${credits.credits} credits purchased.`,
        variant: 'default',
      });

      onPurchaseCompleted?.();
    } catch (e) {
      toast({
        title: 'Purchase failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h4 className="mb-4 text-lg font-bold">Purchase Credits</h4>
      <p className="mb-3 font-normal">
        You are about to buy <b>{credits.credits}</b> Credits for{' '}
        <b>{credits.total}</b> USDC on the <b>Solana</b> chain.
      </p>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-normal">
            Complete your purchase by sending USDC (gas fees may apply).
          </p>
        </div>
        <Button
          loading={isPending}
          onClick={handlePurchase}
          disabled={isPending}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};
