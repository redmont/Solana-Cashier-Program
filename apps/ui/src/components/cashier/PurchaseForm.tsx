import { useEthWallet } from '@/hooks';
import { useMemo } from 'react';
import {
  bytesToHex,
  erc20Abi,
  padBytes,
  formatUnits,
  stringToBytes,
  parseUnits,
} from 'viem';
import { useClient, useReadContract, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
import CashierDeposit from '@bltzr-gg/brawlers-evm-contracts/artifacts/contracts/CashierDeposit.sol/CashierDeposit.json';
import { cashierDepositContractAddress, usdcContractAddress } from '@/config';
import { useAtomValue } from 'jotai';
import { userIdAtom } from '@/store/account';
import { useMutation } from '@tanstack/react-query';
import Spinner from '../ui/spinner';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { CreditAmount } from './utils';

export const PurchaseForm = ({
  credits,
  onPurchaseCompleted,
}: {
  credits: CreditAmount;
  onPurchaseCompleted?: () => void;
  onClose?: () => void;
}) => {
  const { toast } = useToast();
  const userId = useAtomValue(userIdAtom);
  const { address } = useEthWallet();
  const allowance = useReadContract({
    query: {
      enabled: !!address,
    },
    abi: erc20Abi,
    address: usdcContractAddress,
    functionName: 'allowance',
    args: [address!, cashierDepositContractAddress],
  });

  const enoughWasApproved = useMemo(() => {
    return (
      allowance.status === 'success' &&
      Number(formatUnits(allowance.data, 6)) >= credits.price
    );
  }, [allowance.status, allowance.data, credits.price]);

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
      const receipt = await writeContractAsync({
        abi: erc20Abi,
        address: usdcContractAddress,
        functionName: 'approve',
        args: [
          cashierDepositContractAddress,
          parseUnits(credits.price.toString(), 6),
        ],
      });

      return waitForTransactionReceipt(client!, { hash: receipt });
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
        description: `${credits.amount} credits purchased.`,
        variant: 'default',
      });
    },
    mutationFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const receipt = await writeContractAsync({
        abi: CashierDeposit.abi,
        address: cashierDepositContractAddress,
        functionName: 'deposit',
        args: [
          bytesToHex(
            padBytes(stringToBytes(userId), {
              size: 32,
            }),
          ) as `0x${string}`,
          usdcContractAddress,
          parseUnits(credits.price.toString(), 6),
        ],
      });

      return waitForTransactionReceipt(client!, { hash: receipt });
    },
  });

  return (
    <div>
      <h4 className="mb-4 text-lg">Purchase Credits</h4>
      <p className="mb-3 font-normal">
        You are about to buy Game Points. You will have to approve your USDCs in
        your Wallet and then Confirm the Points Purchase
      </p>

      <div className="cashier-modal-actions"></div>
      {allowance.status === 'pending' && (
        <div>
          <Spinner />
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className={cn({ 'text-muted': enoughWasApproved })}>
          <h5>Approve USDC</h5>
          <p className="font-normal">
            {enoughWasApproved
              ? "You've approved a sufficient amount for this transaction."
              : 'This transaction is conducted once per purchase.'}
          </p>
        </div>
        <div>
          <Button
            loading={increaseAllowance.isPending}
            onClick={() => {
              increaseAllowance.mutate();
            }}
            disabled={increaseAllowance.isPending || enoughWasApproved}
          >
            {enoughWasApproved ? 'Approved' : 'Approve USDC'}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h5>Purchase Points</h5>
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
          disabled={!enoughWasApproved || deposit.isPending}
        >
          Purchase
        </Button>
      </div>
    </div>
  );
};
