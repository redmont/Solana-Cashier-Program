'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessages,
} from '@/components/ui/form';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { Input } from '../ui/input';
import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { useWallet } from '@/hooks';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import {
  AmountSchema,
  CreditAmount,
  formatUSDC,
  parseUSDC,
  getPricingConfig,
  priceConfiguration,
  PricedCredits,
} from './utils';
import { useUSDCBalance } from './utilsSolana';
import { useContracts } from '@/hooks/useContracts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import networks from '@/config/networks';
import { Loader2, Wallet2Icon } from 'lucide-react';
import Link from 'next/link';
import * as faucets from '@/config/networks/faucets';
import { cn } from '@/lib/utils';

type Props = {
  onSubmit: (data: PricedCredits) => void;
};

export const AmountSelectionForm: FC<Props> = ({ onSubmit }) => {
  const { depositor } = useContracts();
  const { address, network, switchNetwork, networkId } = useWallet();
  const { primaryWallet } = useDynamicContext();
  const nativeFaucet = faucets.native.find(
    (faucet) => faucet.networkId === networkId?.data,
  );
  const tokenFaucet = faucets.token.find(
    (faucet) =>
      faucet.networkId === networkId?.data &&
      depositor?.parameters.allowedTokenAddress === faucet.contract,
  );

  const {
    balance: solanaBalance,
    loading: solanaLoading,
    status: solanaStatus,
    loadUSDCBalance,
  } = useUSDCBalance();

  const evmBalance = useReadContract({
    query: {
      enabled: !!address,
    },
    abi: erc20Abi,
    address: depositor?.parameters.allowedTokenAddress as
      | `0x${string}`
      | undefined,
    functionName: 'balanceOf',
    args: [(address as `0x${string}`)!],
  });

  useEffect(() => {
    if (primaryWallet?.chain === 'solana') {
      loadUSDCBalance();
    }
  }, [loadUSDCBalance, primaryWallet?.address, primaryWallet?.chain]);

  const balance = useMemo(() => {
    if (primaryWallet?.chain === 'solana') {
      return {
        status: solanaStatus,
        data: solanaBalance ? BigInt(solanaBalance) : BigInt(0),
        isLoading: solanaLoading,
      };
    } else {
      return {
        status: evmBalance.status,
        data: evmBalance.data ? BigInt(evmBalance.data) : BigInt(0),
        isLoading: evmBalance.isLoading,
      };
    }
  }, [
    primaryWallet?.chain,
    solanaStatus,
    solanaBalance,
    solanaLoading,
    evmBalance.status,
    evmBalance.data,
    evmBalance.isLoading,
  ]);

  const balanceInsufficientRefinement = useCallback(
    (credits: CreditAmount) => {
      const config = getPricingConfig(credits.amount);
      return (
        balance.status === 'success' &&
        config &&
        +config.amount <= formatUSDC(balance.data)
      );
    },
    [balance.status, balance.data],
  );

  const form = useForm<CreditAmount>({
    defaultValues: { amount: priceConfiguration.amount },
    resolver: zodResolver(
      AmountSchema.refine(
        () => balance.status !== 'pending',
        'Fetching balance, please wait...',
      )
        .refine(
          () => balance.status !== 'error',
          'An error occurred while fetching balance',
        )
        .refine(
          balanceInsufficientRefinement,
          `Insufficient USDC balance. Select a smaller amount or top up your balance.`,
        ),
    ),
  });

  const priceConfig = getPricingConfig(form.watch('amount'));

  // Just a temporary fix. Handled it properly in the Multi Token PR.
  const totalPriceToDecimals = parseUSDC(priceConfig?.amount ?? 0);
  const insufficientBalance =
    balance.status === 'success' &&
    !!priceConfig &&
    balance.data < +totalPriceToDecimals;

  const _onSubmit = useCallback(
    (data: CreditAmount) => {
      const config = getPricingConfig(data.amount);
      if (!config) {
        throw new Error('Price configuration not found');
      }
      onSubmit(config);
    },
    [onSubmit],
  );

  const networkSelectorLoading =
    switchNetwork.isPending ||
    networkId.isLoading ||
    form.formState.isSubmitting ||
    balance.isLoading;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(_onSubmit)}
        className="space-y-6 px-2 pt-5"
      >
        <div className="flex items-center justify-between gap-3 font-normal">
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={networkSelectorLoading}>
              <Button loading={networkSelectorLoading} variant="dropdown">
                {network?.name ?? 'Select Network'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {networks
                .filter((n) => n.id !== networkId.data)
                .map((network) => (
                  <DropdownMenuItem
                    key={network.id}
                    onClick={() => {
                      switchNetwork.mutate(network.id);
                    }}
                  >
                    {network.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            className={cn('flex items-center gap-2', {
              'text-muted': balance.isLoading,
            })}
          >
            <span>{formatUSDC(balance.data)} USDC</span>
            {balance.status === 'pending' && (
              <Loader2 className="inline-block animate-spin" />
            )}
            {balance.status !== 'pending' && <Wallet2Icon />}
          </div>
        </div>
        {(nativeFaucet || tokenFaucet) && (
          <div className="flex justify-between gap-2">
            {nativeFaucet && (
              <Button>
                <Link target="_blank" href={nativeFaucet.url}>
                  Get {network?.nativeCurrency?.symbol} on {network?.name}
                </Link>
              </Button>
            )}
            {tokenFaucet && (
              <Button>
                <Link target="_blank" href={tokenFaucet.url}>
                  Get token
                </Link>
              </Button>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ formState }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  startAdornment="$"
                  {...form.register('amount', { valueAsNumber: true })}
                  disabled={formState.isSubmitting}
                  placeholder="Enter amount of USDC"
                  type="number"
                  className="w-full rounded-md border [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormMessages className="text-center" />
        <Button
          loading={balance.isLoading}
          disabled={
            switchNetwork.isPending ||
            form.formState.isSubmitting ||
            balance.isLoading ||
            insufficientBalance
          }
          className="w-full"
          type="submit"
        >
          {insufficientBalance ? 'Insufficient USDC balance' : 'Checkout'}
        </Button>
      </form>
    </Form>
  );
};
