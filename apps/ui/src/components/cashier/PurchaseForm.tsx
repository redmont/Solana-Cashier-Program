import { usePostHog, useWallet } from '@/hooks';
import { useMemo } from 'react';
import { bytesToHex, erc20Abi, padBytes, stringToBytes } from 'viem';
import { useClient, useReadContract, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAtomValue } from 'jotai';
import { balanceAtom, userIdAtom } from '@/store/account';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { formatUSDC, parseUSDC, PricedCredits } from './utils';
import { useContracts } from '@/hooks/useContracts';
import assert from 'assert';

const MINIMUM_ALLOWANCE = BigInt(parseUSDC(100));

export const PurchaseForm = ({
  credits,
  onPurchaseCompleted,
}: {
  credits: PricedCredits;
  onPurchaseCompleted?: () => void;
  onClose?: () => void;
}) => {
  const { toast } = useToast();
  const balance = useAtomValue(balanceAtom);
  const userId = useAtomValue(userIdAtom);
  const contracts = useContracts();
  const { address } = useWallet();
  const posthog = usePostHog();
  const allowance = useReadContract({
    query: {
      enabled: !!address && !!contracts.depositor,
    },
    abi: erc20Abi,
    address: contracts.depositor!.parameters
      .allowedTokenAddress as `0x${string}`,
    functionName: 'allowance',
    args: [address!, contracts.depositor!.address as `0x${string}`],
  });

  const approvedAmount = formatUSDC(allowance.data);

  const enoughWasApproved = useMemo(() => {
    return allowance.status === 'success' && approvedAmount >= credits.total;
  }, [allowance.status, approvedAmount, credits.total]);

  const client = useClient();
  const { writeContractAsync } = useWriteContract();

  const increaseAllowance = useMutation({
    onError: (error) => {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    mutationFn: async () => {
      assert(contracts.depositor, 'Depositor contract not found');
      const amount = BigInt(parseUSDC(credits.total));

      const receipt = await writeContractAsync({
        abi: erc20Abi,
        address: contracts.depositor?.parameters
          .allowedTokenAddress as `0x${string}`,
        functionName: 'approve',
        args: [
          contracts.depositor!.address,
          amount < MINIMUM_ALLOWANCE ? MINIMUM_ALLOWANCE : amount,
        ],
      });

      return waitForTransactionReceipt(client!, { hash: receipt });
    },
    onSuccess: () => {
      allowance.refetch();
    },
  });

  const deposit = useMutation({
    onError: (error) => {
      toast({
        title: 'Purchase failed',
        description: error.message,
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
        cost: credits.total,
        prevCreditBalance: balance,
      });
    },
    mutationFn: async () => {
      assert(contracts.depositor, 'Depositor contract not found');
      assert(userId !== undefined, 'User ID is required');

      const receipt = await writeContractAsync({
        abi: contracts.depositor.abi,
        address: contracts.depositor.address,
        functionName: 'deposit',
        args: [
          bytesToHex(
            padBytes(stringToBytes(userId), {
              size: 32,
            }),
          ) as `0x${string}`,
          contracts.depositor.parameters.allowedTokenAddress as `0x${string}`,
          parseUSDC(credits.total),
        ],
      });

      return waitForTransactionReceipt(client!, { hash: receipt });
    },
  });

  return (
    <div>
      <h4 className="mb-4 text-lg font-bold">Purchase Credits</h4>
      <p className="mb-3 font-normal">
        You are about to buy Game Points. You will have to approve your USDCs in
        your Wallet and then Confirm the Points Purchase
      </p>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={cn({ 'text-muted': enoughWasApproved })}>
          <h5 className="font-bold">Approve USDC</h5>
          <p className="font-normal">
            {enoughWasApproved
              ? `You still have ${approvedAmount} USDC approved for this transaction.`
              : 'This transaction is conducted once per purchase.'}
          </p>
        </div>
        <div>
          <Button
            loading={increaseAllowance.isPending || allowance.isPending}
            onClick={() => {
              increaseAllowance.mutate();
            }}
            disabled={increaseAllowance.isPending || enoughWasApproved}
          >
            {enoughWasApproved ? 'Approved' : 'Approve USDC'}
          </Button>
        </div>
      </div>
      {contracts.depositor?.parameters.allowedTokenAddress}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h5 className="font-bold">Purchase Points</h5>
          <p className="font-normal">
            Confirm the purchase in your wallet. Additional fees can be
            included.
          </p>
        </div>
        <Button
          loading={deposit.isPending}
          onClick={() => {
            deposit.mutate();
          }}
          disabled={
            !enoughWasApproved ||
            increaseAllowance.isPending ||
            deposit.isPending
          }
        >
          Purchase
        </Button>
      </div>
    </div>
  );
};
