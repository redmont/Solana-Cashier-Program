import dayjs from 'dayjs';

export const openNewTab = (url: string) => {
  window?.open(url, '_blank')?.focus();
};

export function toBase26(num: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';

  if (num < 0) {
    throw 'Number must be positive';
  }

  if (num === 0) {
    return chars[0];
  }

  let result = '';

  while (num > 0) {
    result = chars[num % 26] + result;
    num = Math.floor(num / 26);
  }

  return result;
}

export function toScientificParts(num: number) {
  if (num === 0) {
    return { base: 0, exponent: 0 };
  }

  const [base, exponent] = num.toExponential().split('e');
  return {
    base: parseFloat(base),
    exponent: parseInt(exponent, 10),
  };
}

export const truncateEthAddress = (walletAddress: string) => {
  if (!walletAddress || walletAddress.length < 10) {
    return walletAddress;
  }

  return walletAddress.slice(0, 8) + '...' + walletAddress.slice(-4);
};

export function getNormalizedTimeDifference(args: {
  t1: dayjs.ConfigType;
  t2: dayjs.ConfigType;
  normaliseBy?: number;
}) {
  const t1 = dayjs(args.t1);
  const t2 = dayjs(args.t2);

  const diffDays = t2.diff(t1, 'day', true);

  // default normalise by 24 hours
  return diffDays / (args.normaliseBy ?? 1);
}

export const calculateWinRate = (fighterTotal: number, opponentTotal: number) =>
  (1 + (fighterTotal > 0 ? opponentTotal / fighterTotal : 0)).toFixed(2);
