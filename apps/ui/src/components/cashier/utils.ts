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
  credits: number;
  pricePerCredit: number;
  presets: number[];
};

export const priceConfiguration: PricingConfig = {
  credits: 10000,
  pricePerCredit: 0.000099,
  presets: [10_000, 100_000, 1_000_000, 100_000_000],
};

export const getPricingConfig = (credits: number) => {
  if (isNaN(credits)) {
    return null;
  }
  return {
    ...priceConfiguration,
    credits,
    total: parseFloat(
      (credits * (priceConfiguration?.pricePerCredit ?? 0)).toFixed(
        TOKEN_DECIMALS,
      ),
    ),
  };
};

export type PricedCredits = NonNullable<ReturnType<typeof getPricingConfig>>;

export const getPrice = (credits: number) =>
  (getPricingConfig(credits)?.pricePerCredit ?? 0) * credits;

export const AmountSchema = z.object({
  amount: z
    .number({ message: 'Amount needs to be a number' })
    .positive('Amount needs to be a positive number')
    .int('Whole credits only')
    .min(
      priceConfiguration.credits,
      `Minimum amount is ${priceConfiguration.credits} credits`,
    ),
});

export type CreditAmount = z.infer<typeof AmountSchema>;
