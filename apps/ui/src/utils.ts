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
