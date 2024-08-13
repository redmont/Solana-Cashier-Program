import { formatUnits } from 'viem';
import { z } from 'zod';

const USDC_DECIMALS = 6;

export const formatUSDC = (amount = BigInt(0)) =>
  parseFloat(formatUnits(amount, USDC_DECIMALS));

const CREDITS_PER_USDC = 100;

export const priceConfigurations: Record<number, number> = {
  1000: 10,
  2000: 18,
  3000: 25,
};

export const getCreditPrice = (credits: number) => {
  if (isNaN(credits)) {
    return 0;
  }
  return (
    priceConfigurations[credits] ?? (credits / CREDITS_PER_USDC).toFixed(2)
  );
};

export const AmountSchema = z
  .object({
    amount: z
      .number({ message: 'Amount needs to be a number' })
      .positive('Amount needs to be a positive number')
      .int('Whole credits only')
      .min(100, 'Minimum amount is 100 credits'),
  })
  .transform((data) => {
    return {
      amount: data.amount,
      price: getCreditPrice(data.amount),
    };
  });

export type CreditAmount = z.infer<typeof AmountSchema>;
