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
  // truncate all decimals because smart contract doesnt allow them
  const truncated = parseFloat(usdc.toFixed(0));
  return parseFloat((truncated * 10 ** TOKEN_DECIMALS).toFixed(0));
};

type PricingConfig = {
  hidden?: boolean;
  credits: number;
  pricePerCredit: number;
  discount: string;
};

export const priceConfigurations: PricingConfig[] = [
  {
    credits: 10000,
    pricePerCredit: 0.000099,
    discount: '0%',
  },
  {
    hidden: true,
    credits: 55000,
    pricePerCredit: 0.000091,
    discount: '8%',
  },
  {
    credits: 115000,
    pricePerCredit: 0.000087,
    discount: '12%',
  },
  {
    hidden: true,
    credits: 600000,
    pricePerCredit: 0.000083,
    discount: '16%',
  },
  {
    credits: 1250000,
    pricePerCredit: 0.00008,
    discount: '19%',
  },
  {
    hidden: true,
    credits: 4000000,
    pricePerCredit: 0.000075,
    discount: '24%',
  },
  {
    hidden: true,
    credits: 15000000,
    pricePerCredit: 0.000067,
    discount: '33%',
  },
  {
    credits: 125000000,
    pricePerCredit: 0.00006,
    discount: '39%',
  },
] as const;

export const getPricingConfig = (credits: number) => {
  if (isNaN(credits)) {
    return null;
  }
  const config = priceConfigurations.find((c) => credits <= c.credits);

  if (!config) {
    throw new Error('Price configuration not found');
  }
  return {
    ...config,
    credits,
    total: parseFloat(
      (credits * (config?.pricePerCredit ?? 0)).toFixed(TOKEN_DECIMALS),
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
      priceConfigurations[0]?.credits,
      `Minimum amount is ${priceConfigurations[0]?.credits} credits`,
    ),
});

export type CreditAmount = z.infer<typeof AmountSchema>;
