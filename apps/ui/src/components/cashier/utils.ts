import { formatUnits } from 'viem';
import { z } from 'zod';

export const TOKEN_DECIMALS = 6;

/**
 *  Divides a number by a 6 exponent of base 10 (10exponent), and formats it into a string representation of the number.
 *
 * @example
 * import { formatUSDC } from './utils'
 *
 * formatUSDC(420000000n)
 * // '420'
 */
export const formatUSDC = (amount = BigInt(0)) =>
  parseFloat(formatUnits(amount, TOKEN_DECIMALS));

/**
 * Multiplies a string representation of a number by 6 of base 10 (10exponent).
 *
 * @example
 * import { parseUSDC } from './utils'
 *
 * parseUnits('420')
 * // 420000000n
 */
export const parseUSDC = (usdc: number) => {
  return parseFloat((usdc * 10 ** TOKEN_DECIMALS).toFixed(0));
};

type PricingConfig = {
  amount: number;
  pricePerCredit: number;
};

export const priceConfiguration: PricingConfig = {
  amount: 20,
  pricePerCredit: 0.0001,
} as const;

const getCreditAmount = (amountInUsdc: number) => {
  const creditPrice = 100;

  // Calculate credit amount, considering USDC is 6 decimal places
  const creditAmount = Math.ceil(
    (parseInt(amountInUsdc.toString()) * 10 ** 6) / creditPrice,
  );
  return creditAmount;
};

export const getPricingConfig = (amount: number) => {
  if (isNaN(amount)) {
    return null;
  }
  return {
    pricePerCredit: priceConfiguration.pricePerCredit,
    credits: getCreditAmount(amount),
    amount,
  };
};

export type PricedCredits = NonNullable<ReturnType<typeof getPricingConfig>>;

export const getPrice = (credits: number) =>
  credits * priceConfiguration.pricePerCredit;

export const getCredits = (price: number) =>
  price / priceConfiguration.pricePerCredit;

export const AmountSchema = z.object({
  amount: z
    .number({ message: 'Amount needs to be a number' })
    .positive('Amount needs to be a positive number')
    .min(1, `Minimum amount is $1`),
});

export type CreditAmount = z.infer<typeof AmountSchema>;
