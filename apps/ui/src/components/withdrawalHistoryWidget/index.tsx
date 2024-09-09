import { ChainId } from '@/config/chains';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import dayjs from '@/dayjs';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Scrollable } from '../ui/scrollable';
import { useCountdown } from '@/hooks';
import { cn } from '@/lib/utils';
import { FC } from 'react';
import lfb from './lfb.png';
import B3Spinner from '../B3Spinner/B3Spinner';
import SomethingWentWrong from '../somethingWentWrong';

const WithdrawalStatusSchema = z.enum(['Pending', 'Completed', 'Failed']);

type WithdrawalStatus = z.infer<typeof WithdrawalStatusSchema>;

const APPROVAL_WAIT_TIME = 1000 * 60 * 60 * 24; // 1 day
const isReadyForApproval = (withdrawal: (typeof data)[number]) =>
  dayjs(withdrawal.createdAt).add(APPROVAL_WAIT_TIME, 'ms').isBefore();

type Withdrawal = {
  status: WithdrawalStatus;
  id: number;
  tokenSymbol: string;
  decimals: number;
  chainId: ChainId;
  txUrl?: string;
  createdAt: string;
  updatedAt: string;
  reason?: string;
  credits: number;
  amount: bigint;
};

const data: Withdrawal[] = [
  {
    id: 1,
    tokenSymbol: 'USDC',
    decimals: 6,
    chainId: 11155111,
    txUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef12345678',
    status: 'Completed',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 120000,
    amount: BigInt(100000000),
  },
  {
    id: 2,
    tokenSymbol: 'ETH',
    decimals: 18,
    chainId: 11155111,
    status: 'Pending',
    createdAt: new Date(
      new Date().getTime() - APPROVAL_WAIT_TIME,
    ).toISOString(),
    updatedAt: new Date(
      new Date().getTime() - APPROVAL_WAIT_TIME,
    ).toISOString(),
    credits: 100000,
    amount: BigInt('1500000000000000000'),
  },
  {
    id: 3,
    tokenSymbol: 'MATIC',
    decimals: 18,
    chainId: 80002,
    status: 'Failed',
    reason: 'Expired',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 3123412,
    amount: BigInt('200000000000000000000'),
  },
  {
    id: 4,
    tokenSymbol: 'ETH',
    decimals: 18,
    chainId: 11155111,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    credits: 100000,
    amount: BigInt('1500000000000000000'),
  },
  {
    id: 5,
    tokenSymbol: 'USDC',
    decimals: 6,
    chainId: 11155111,
    txUrl: 'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef12345678',
    status: 'Completed',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 120000,
    amount: BigInt(100000000),
  },
  {
    id: 6,
    tokenSymbol: 'ETH',
    decimals: 18,
    chainId: 11155111,
    status: 'Pending',
    createdAt: new Date(
      new Date().getTime() - APPROVAL_WAIT_TIME,
    ).toISOString(),
    updatedAt: new Date(
      new Date().getTime() - APPROVAL_WAIT_TIME,
    ).toISOString(),
    credits: 100000,
    amount: BigInt('1500000000000000000'),
  },
  {
    id: 7,
    tokenSymbol: 'MATIC',
    decimals: 18,
    chainId: 80002,
    status: 'Failed',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 3123412,
    amount: BigInt('200000000000000000000'),
  },
  {
    id: 8,
    tokenSymbol: 'ETH',
    decimals: 18,
    chainId: 11155111,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    credits: 100000,
    amount: BigInt('1500000000000000000'),
  },
  {
    id: 9,
    tokenSymbol: 'MATIC',
    decimals: 18,
    chainId: 80002,
    status: 'Failed',
    reason: 'KYC Failure',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 3123412,
    amount: BigInt('200000000000000000000'),
  },
  {
    id: 10,
    tokenSymbol: 'MATIC',
    decimals: 18,
    chainId: 80002,
    status: 'Failed',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 3123412,
    amount: BigInt('200000000000000000000'),
  },

  {
    id: 11,
    tokenSymbol: 'MATIC',
    decimals: 18,
    chainId: 80002,
    status: 'Failed',
    reason: 'None Provided',
    createdAt: '2023-08-01T10:15:30Z',
    updatedAt: '2023-08-02T11:20:35Z',
    credits: 3123412,
    amount: BigInt('200000000000000000000'),
  },
] as const;

type WithdrawalProps = {
  withdrawal: Withdrawal;
  className?: string;
  onApprove?: () => void;
};

const Withdrawal: FC<WithdrawalProps> = ({
  className,
  withdrawal,
  onApprove,
}) => {
  const approveWithdrawal = useMutation({
    mutationFn: (_id: Withdrawal['id']) =>
      new Promise((resolve) => setTimeout(resolve, 1000)),
    onSuccess: onApprove,
  });

  const duration = dayjs.duration(
    useCountdown(dayjs(withdrawal.createdAt).add(APPROVAL_WAIT_TIME, 'ms')),
  );

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg p-5 odd:bg-black/25 sm:col-span-4 sm:grid sm:grid-cols-subgrid sm:p-2',
        className,
      )}
    >
      <div>{dayjs(withdrawal.createdAt).format('DD/MM/YYYY')}</div>
      <div>{withdrawal.credits.toLocaleString()} credits</div>
      <div className="font-semibold text-white">
        {formatUnits(withdrawal.amount, withdrawal.decimals)}{' '}
        {withdrawal.tokenSymbol}
      </div>
      <div className="w-full text-center sm:col-span-1 sm:text-right">
        {withdrawal.status === 'Pending' && isReadyForApproval(withdrawal) && (
          <Button
            loading={approveWithdrawal.isPending}
            className="w-full"
            variant="secondary"
            onClick={() => approveWithdrawal.mutate(withdrawal.id)}
          >
            Complete Withdrawal
          </Button>
        )}
        {withdrawal.status === 'Pending' && !isReadyForApproval(withdrawal) && (
          <Button className="w-full" variant="outline-secondary" disabled>
            Ready in {duration.format('HH:mm:ss')}
          </Button>
        )}
        {withdrawal.status === 'Completed' && withdrawal.txUrl && (
          <Link
            className="w-full text-right"
            href={withdrawal.txUrl}
            target="_blank"
            rel="noreferrer"
          >
            Completed
            <SquareArrowOutUpRight className="ml-1 inline-block size-4" />
          </Link>
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
  const withdrawals = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => Promise.resolve(data),
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
      <h2 className="mb-4 text-2xl font-semibold text-white">
        Withdrawal History
      </h2>
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
            <Withdrawal withdrawal={withdrawal} key={withdrawal.id} />
          ))}
        </div>
      </Scrollable>
    </div>
  );
};

export default WithdrawalHistoryWidget;
