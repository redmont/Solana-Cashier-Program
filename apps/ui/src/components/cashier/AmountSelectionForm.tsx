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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FC, useCallback, useState } from 'react';
import { Input } from '../ui/input';
import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { useWallet } from '@/hooks';
import {
  AmountSchema,
  CreditAmount,
  formatUSDC,
  getPricingConfig,
  priceConfigurations,
  PricedCredits,
} from './utils';
import { cn } from '@/lib/utils';
import { useContracts } from '@/hooks/useContracts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import networks from '@/config/chains';
import { Wallet2Icon } from 'lucide-react';

type Props = {
  onSubmit: (data: PricedCredits) => void;
};

export const AmountSelectionForm: FC<Props> = ({ onSubmit }) => {
  const { depositor } = useContracts();
  const [customEnabled, setCustomEnabled] = useState(false);
  const { address, network, switchNetwork, networkId } = useWallet();

  const balance = useReadContract({
    query: {
      enabled: !!address,
    },
    abi: erc20Abi,
    address: depositor?.parameters.allowedTokenAddress as
      | `0x${string}`
      | undefined,
    functionName: 'balanceOf',
    args: [address!],
  });

  const balanceInsufficientRefinement = useCallback(
    (credits: CreditAmount) => {
      const config = getPricingConfig(credits.amount);
      return (
        balance.status === 'success' &&
        config &&
        +config.total <= formatUSDC(balance.data)
      );
    },
    [balance.status, balance.data],
  );

  const form = useForm<CreditAmount>({
    defaultValues: { amount: priceConfigurations[0].credits },
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
  const insufficientBalance =
    balance.status === 'success' &&
    !!priceConfig &&
    balance.data < +priceConfig.total;

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(_onSubmit)}
        className="space-y-6 px-2 pt-5"
      >
        <div className="flex items-center justify-between gap-3 font-normal">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                loading={networkId.isLoading || switchNetwork.isPending}
                variant="dropdown"
                className="w-full"
              >
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

          <div className="flex items-center gap-2">
            <span>{formatUSDC(balance.data)} USDC</span>
            <Wallet2Icon />
          </div>
        </div>
        <FormField
          control={form.control}
          name="amount"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel className="mb-4 text-lg">
                Choose amount to deposit.
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    setCustomEnabled(value === 'Custom');
                    if (value !== 'Custom') {
                      form.setValue('amount', parseInt(value));
                    }
                  }}
                  defaultValue={priceConfigurations[0].credits.toString()}
                  className="flex flex-col space-y-1"
                >
                  {priceConfigurations
                    .filter((config) => !config.hidden)
                    .map(({ credits, pricePerCredit: price }) => (
                      <FormItem
                        key={credits}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={credits.toString()} />
                        </FormControl>
                        <div className="flex grow justify-between">
                          <FormLabel className="font-semibold text-white">
                            {credits.toLocaleString('en-US')} credits
                          </FormLabel>
                          <FormLabel className="font-normal">
                            {(price * credits).toFixed(2)} USDC
                          </FormLabel>
                        </div>
                      </FormItem>
                    ))}
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Custom" />
                    </FormControl>
                    <FormLabel className="font-normal text-white">
                      Custom
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ formState }) => (
            <FormItem>
              <div className="flex justify-between">
                <FormLabel>Amount</FormLabel>
                {priceConfig?.discount &&
                  parseInt(priceConfig.discount) > 0 && (
                    <FormLabel
                      className={cn('flex gap-1 font-bold', {
                        hidden: parseInt(priceConfig?.discount) === 0,
                        'text-secondary': parseInt(priceConfig?.discount) < 20,
                        'animate-pulse-fast text-[#d84315]':
                          parseInt(priceConfig?.discount) >= 20,
                      })}
                    >
                      <span
                        className={cn({
                          hidden: parseInt(priceConfig?.discount) < 20,
                        })}
                      >
                        🔥
                      </span>
                      Discounted: {priceConfig?.discount}
                      <span
                        className={cn({
                          hidden: parseInt(priceConfig?.discount) < 20,
                        })}
                      >
                        🔥
                      </span>
                    </FormLabel>
                  )}
              </div>
              <FormControl>
                <Input
                  endAdornment={`${priceConfig?.total.toFixed(2) ?? ''} USDC`}
                  {...form.register('amount', { valueAsNumber: true })}
                  disabled={formState.isSubmitting || !customEnabled}
                  placeholder="Enter amount of credits"
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
