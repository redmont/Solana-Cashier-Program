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
import { usdcContractAddress } from '@/config';
import { useEthWallet } from '@/hooks';
import {
  AmountSchema,
  CreditAmount,
  formatUSDC,
  getCreditPrice,
  priceConfigurations,
} from './utils';

type Props = {
  onSubmit: (data: CreditAmount) => void;
};

export const AmountSelectionForm: FC<Props> = ({ onSubmit }) => {
  const [customEnabled, setCustomEnabled] = useState(false);
  const { address } = useEthWallet();

  const balance = useReadContract({
    query: {
      enabled: !!address,
    },
    abi: erc20Abi,
    address: usdcContractAddress,
    functionName: 'balanceOf',
    args: [address!],
  });

  const balanceInsufficientRefinement = useCallback(
    (credits: CreditAmount) => {
      return (
        balance.status === 'success' &&
        credits.price <= formatUSDC(balance.data)
      );
    },
    [balance.status, balance.data],
  );

  const form = useForm<CreditAmount>({
    defaultValues: { amount: 1000 },
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
          `You don't have enough balance to proceed. Enter smaller amount or top up your balance.`,
        ),
    ),
  });

  const price = getCreditPrice(form.watch('amount'));
  const insufficientBalance =
    balance.status === 'success' && formatUSDC(balance.data) < price;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-2">
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
                  defaultValue={'1000'}
                  className="flex flex-col space-y-1"
                >
                  {Object.entries(priceConfigurations).map(
                    ([preset, price]) => (
                      <FormItem
                        key={preset}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={preset} />
                        </FormControl>
                        <div className="flex grow justify-between">
                          <FormLabel className="font-semibold">
                            {preset} credits
                          </FormLabel>
                          <FormLabel className="font-normal">
                            {price} USDC
                          </FormLabel>
                        </div>
                      </FormItem>
                    ),
                  )}
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Custom" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom</FormLabel>
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  endAdornment={`${price} USDC`}
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
        <div className="flex justify-between gap-3 font-normal">
          <span>Your balance</span>
          <span>
            {(parseFloat(balance.data?.toString() ?? '0') / 1000000).toFixed(2)}{' '}
            USDC
          </span>
        </div>
        <Button
          loading={balance.isLoading}
          disabled={
            form.formState.isSubmitting ||
            balance.isLoading ||
            insufficientBalance
          }
          className="w-full"
          type="submit"
        >
          {insufficientBalance ? 'Insufficient Balance' : 'Purchase Credits'}
        </Button>
      </form>
    </Form>
  );
};
