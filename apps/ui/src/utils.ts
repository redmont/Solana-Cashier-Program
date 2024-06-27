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

export const truncateEthAddress = (walletAddress: string) => {
  if (!walletAddress || walletAddress.length < 10) return walletAddress;

  return walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4);
};

const subscriptMap: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};
export const formatNumber = (args: {
  number: number;
  decimals: number;
  prominentDigits?: number;
}) => {
  const { number, decimals, prominentDigits = 2 } = args;
  let numStr = number.toFixed(decimals);
  let chars = numStr.split('');

  for (let i = 0; i < chars.length - prominentDigits; i++) {
    if (subscriptMap[chars[i]]) {
      chars[i] = subscriptMap[chars[i]];
    }
  }
  return chars.join('');
};
