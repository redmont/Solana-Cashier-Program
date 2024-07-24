import dayjs from 'dayjs';

export const openNewTab = (url: string) => {
  window?.open(url, '_blank')?.focus();
};

export class ManualPromise<T = void> extends Promise<T> {
  private _resolve!: (value: T | PromiseLike<T>) => void;
  private _reject!: (reason?: any) => void;

  constructor() {
    let _resolve!: (value: T | PromiseLike<T>) => void;
    let _reject!: (reason?: any) => void;

    super((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    this._resolve = _resolve;
    this._reject = _reject;
  }

  resolve(value: T | PromiseLike<T>) {
    this._resolve(value);

    return this;
  }

  reject(reason?: any) {
    this._reject(reason);

    return this;
  }
}

// This is important to keep Promise work as expected
// https://stackoverflow.com/questions/48158730/extend-javascript-promise-and-resolve-or-reject-it-inside-constructor
ManualPromise.prototype.constructor = Promise;

export async function waitAsync(func: Function) {
  return (...args: any[]) => {
    return func(...args);
  };
}

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
  if (!walletAddress || walletAddress.length < 10) return walletAddress;

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
