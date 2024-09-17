import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import dayjs from '@/dayjs';
import { BaseError, ContractFunctionRevertedError, formatUnits } from 'viem';
import Link from 'next/link';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Scrollable } from '../ui/scrollable';
import { useCountdown, useSocket } from '@/hooks';
import { cn } from '@/lib/utils';
import { FC } from 'react';
import lfb from './lfb.png';
import B3Spinner from '../B3Spinner/B3Spinner';
import SomethingWentWrong from '../somethingWentWrong';
import {
  GetWithdrawalsMessage,
  GetWithdrawalsMessageResponse,
  MarkWithdrawalAsCompleteMessage,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useChainId, useClient, useWriteContract } from 'wagmi';
import { useContracts } from '@/hooks/useContracts';
import { waitForTransactionReceipt } from 'viem/actions';
import assert from 'assert';
import { useToast } from '../ui/use-toast';
import chains from '@/config/networks';

const WithdrawalStatusSchema = z.enum(['Pending', 'Completed', 'Failed']);

type WithdrawalStatus = z.infer<typeof WithdrawalStatusSchema>;

const isReadyForApproval = (withdrawal: Withdrawal) =>
  dayjs(withdrawal.validFrom).isBefore();

type Withdrawal = {
  status: WithdrawalStatus;
  receiptId: string;
  tokenSymbol: string;
  chainId: string;
  txUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  reason?: string;
  creditAmount: number;
  tokenAmount: bigint;
  tokenDecimals: number;
  validFrom: string;
  validTo: string;
  signature: string;
};

const txUrl = (caip2ChainId: string, txHash?: string) => {
  if (!txHash) {
    return null;
  }

  const [, reference] = caip2ChainId.split(':');

  const chain = chains.find((chain) => chain.id === reference);

  if (!chain) {
    return null;
  }

  const explorerUrl = chain.blockExplorers?.default?.url;

  if (!explorerUrl) {
    return null;
  }

  return `${explorerUrl}/tx/${txHash}`;
};

type WithdrawalProps = {
  withdrawal: Withdrawal;
  className?: string;
  onApprove?: () => void;
};

const errorMessages: Record<string, string> = {
  WithdrawalTooEarly: 'Too early to complete withdrawal',
  WithdrawalTooLate: 'Too late to complete withdrawal',
  WithdrawalAlreadyPaidOut: 'Already paid out',
  InsufficientBalance: 'Insufficient balance',
};

const CompletedTxLink: FC<{ withdrawal: Withdrawal }> = ({ withdrawal }) => {
  const txUrl = withdrawal.txUrl;

  if (!txUrl) {
    return <span className="text-right">Completed</span>;
  }

  return (
    <Link
      className="w-full text-right"
      href={txUrl}
      target="_blank"
      rel="noreferrer"
    >
      Completed
      <SquareArrowOutUpRight className="ml-1 inline-block size-4" />
    </Link>
  );
};

const Withdrawal: FC<WithdrawalProps> = ({
  className,
  withdrawal,
  onApprove,
}) => {
  const { writeContractAsync } = useWriteContract();
  const client = useClient();
  const contracts = useContracts();
  const { toast } = useToast();
  const { send } = useSocket();
  const queryClient = useQueryClient();
  const chainId = useChainId();

  if (contracts.isSuccess && contracts.type !== 'eip155') {
    throw new Error('Only EVM chains are supported');
  }

  const approveWithdrawal = useMutation({
    onError: (error) => {
      let errorMessage = error.message;

      if (
        error instanceof BaseError &&
        error.cause instanceof ContractFunctionRevertedError
      ) {
        const errorName = error.cause?.data?.errorName;
        if (errorName) {
          errorMessage = errorMessages[errorName];
        }
      }

      toast({
        title: 'Withdrawal failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
    mutationFn: async (_id: Withdrawal['receiptId']) => {
      assert(
        contracts.isSuccess && contracts.withdrawer,
        'Withdrawer contract not found',
      );

      const { receiptId, tokenAmount, validFrom, validTo, signature } =
        withdrawal;

      const validFromUnix = dayjs(validFrom).unix();
      const validToUnix = dayjs(validTo).unix();

      const receipt = await writeContractAsync({
        abi: contracts.withdrawer?.abi,
        address: contracts.withdrawer?.address,
        functionName: 'withdrawWithReceipt',
        args: [
          `0x${receiptId}`,
          tokenAmount,
          validFromUnix,
          validToUnix,
          chainId,
          signature,
        ],
      });

      await waitForTransactionReceipt(client!, { hash: receipt });

      await send(new MarkWithdrawalAsCompleteMessage(receiptId, receipt));

      queryClient.invalidateQueries({
        queryKey: ['withdrawals'],
      });
    },
    onSuccess: onApprove,
  });

  const duration = dayjs.duration(useCountdown(dayjs(withdrawal.validFrom)));

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg p-5 odd:bg-black/25 sm:col-span-4 sm:grid sm:grid-cols-subgrid sm:p-2',
        className,
      )}
    >
      <div>{dayjs(withdrawal.createdAt).format('DD/MM/YYYY')}</div>
      <div>{withdrawal.creditAmount.toLocaleString()} credits</div>
      <div className="font-semibold text-white">
        {formatUnits(withdrawal.tokenAmount, withdrawal.tokenDecimals)}{' '}
        {withdrawal.tokenSymbol}
      </div>
      <div className="w-full text-center sm:col-span-1 sm:text-right">
        {withdrawal.status === 'Pending' && isReadyForApproval(withdrawal) && (
          <Button
            loading={approveWithdrawal.isPending}
            className="w-full"
            variant="secondary"
            onClick={() => approveWithdrawal.mutate(withdrawal.receiptId)}
          >
            {approveWithdrawal.isPending
              ? 'Processing...'
              : 'Complete Withdrawal'}
          </Button>
        )}
        {withdrawal.status === 'Pending' && !isReadyForApproval(withdrawal) && (
          <Button className="w-full" variant="outline-secondary" disabled>
            Ready in {duration.format('HH:mm:ss')}
          </Button>
        )}
        {withdrawal.status === 'Completed' && (
          <CompletedTxLink withdrawal={withdrawal} />
        )}
        {withdrawal.status === 'Failed' && (
          <span className="text-destructive">
            Failed{' '}
            <span className={cn({ hidden: !withdrawal.reason })}>
              ({withdrawal.reason})
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

const WithdrawalHistoryWidget: FC<{ className?: string }> = ({ className }) => {
  const { send } = useSocket();

  const withdrawals = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const data = await send<
        GetWithdrawalsMessage,
        GetWithdrawalsMessageResponse
      >(new GetWithdrawalsMessage());

      return data.withdrawals.map((withdrawal) => ({
        ...withdrawal,
        tokenAmount: BigInt(withdrawal.tokenAmount),
        txUrl: txUrl(withdrawal.chainId, withdrawal.transactionHash),
      }));
    },
  });

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-md border border-border bg-foreground p-4 sm:h-full',
        className,
      )}
    >
      <div className="absolute left-0 top-0 flex size-full flex-col items-center justify-center gap-3 px-3 py-5">
        {withdrawals.isLoading && <B3Spinner withDots size="lg" />}
        {withdrawals.isError && <SomethingWentWrong size="lg" />}
      </div>
      <h2 className="mb-4 text-2xl font-semibold text-white">Withdrawals</h2>
      <Scrollable className="-mx-4 grow overflow-auto px-4">
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-4 sm:gap-1">
          {withdrawals.data?.length === 0 && (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 px-3 py-5">
              <img src={lfb.src} alt="" className="w-48" />
              <p className="text-center text-2xl font-semibold text-white">
                You have no withdrawals yet
              </p>
            </div>
          )}
          {withdrawals.data?.map((withdrawal) => (
            <Withdrawal withdrawal={withdrawal} key={withdrawal.receiptId} />
          ))}
        </div>
      </Scrollable>
    </div>
  );
};

export default WithdrawalHistoryWidget;
