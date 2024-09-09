import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessages,
} from '@/components/ui/form';
import chains, { ChainId } from '@/config/chains';
import { Input } from '../ui/input';
import { useWallet } from '@/hooks';
import { NetworkSelector } from '@/components/networkSelector';
import { z } from 'zod';
import { useAtomValue } from 'jotai';
import { balanceAtom } from '@/store/account';
import { getPrice } from '../cashier/utils';
import { FEE_PERCENT } from '@/config/withdrawals';

type FormValues = {
  credits: number;
  networkId: ChainId;
};

type WithdrawalFormProps = {
  onSubmit: (data: FormValues) => void;
};

const toLocaleAndFixed = (value: number) =>
  value.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

const WithdrawalForm: FC<WithdrawalFormProps> = ({ onSubmit }) => {
  const { networkId } = useWallet();
  const balance = useAtomValue(balanceAtom);

  const FormValuesSchema = useMemo(
    () =>
      z.object({
        credits: z
          .number({ message: 'Amount needs to be a number.' })
          .min(0)
          .refine(
            (n) => balance !== undefined && n <= balance,
            'Insufficient balance',
          ),
        networkId: z.number().refine((n): n is ChainId => {
          const found = chains.find((c) => c.id === n);
          return found !== undefined;
        }, 'Invalid network selected'),
      }),
    [balance],
  );

  const form = useForm<FormValues>({
    defaultValues: { credits: 0, networkId: networkId?.data },
    resolver: zodResolver(FormValuesSchema),
  });

  const creditsValue = form.watch('credits');
  const usdcValue = isNaN(creditsValue) ? 0 : getPrice(creditsValue);
  const fee = usdcValue * FEE_PERCENT;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 px-2 pt-5"
      >
        <FormItem>
          <FormControl>
            <NetworkSelector
              selected={form.watch('networkId')}
              onSelect={(networkId) => {
                form.setValue('networkId', networkId);
              }}
            />
          </FormControl>
        </FormItem>
        <p className="leading-tight text-white">
          Withdrawing Credits is a two-step process: first submit the withdrawal
          for processing, then to confirm the transaction in your wallet.
        </p>
        <FormField
          control={form.control}
          name="credits"
          render={({ formState }) => (
            <FormItem>
              <FormLabel>
                Available to withdraw: {toLocaleAndFixed(balance ?? 0)} credits
              </FormLabel>
              <FormControl>
                <Input
                  {...form.register('credits', { valueAsNumber: true })}
                  endAdornment={
                    <Button
                      onClick={() => form.setValue('credits', balance ?? 0)}
                      className="-mx-3 rounded-md focus:ring-0 focus:ring-offset-0"
                      variant="ghost"
                      type="button"
                    >
                      Max
                    </Button>
                  }
                  disabled={formState.isSubmitting}
                  placeholder="Enter amount of credits"
                  type="number"
                  className="w-full rounded-md border [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormMessages className="text-center" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">USDC Value</span>
            <span>${usdcValue.toFixed(2)} USDC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Fee</span>
            <span>${(usdcValue * FEE_PERCENT).toFixed(2)} USDC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white">Total to receive</span>
            <span>${(usdcValue - fee).toFixed(2)} USDC</span>
          </div>
        </div>
        <Button
          loading={balance === undefined}
          disabled={form.formState.isSubmitting || balance === undefined}
          className="w-full"
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

const WithdrawalModal: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const handleWithdrawalSubmit = (data: FormValues) => {
    // Handle the withdrawal submission logic here
    // eslint-disable-next-line no-console
    console.log('Withdrawal amount:', data.credits);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Withdraw credits</DialogTitle>
        </DialogHeader>
        <WithdrawalForm onSubmit={handleWithdrawalSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
