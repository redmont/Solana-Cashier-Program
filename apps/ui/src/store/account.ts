import { getPrice } from '@/components/cashier/utils';
import { MINIMUM_USD_WITHDRAWAL } from '@/config/withdrawals';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const userReferrerAtom = atomWithStorage<string | null>(
  'fp_ref',
  null,
  undefined,
  { getOnInit: true },
);

export const accountAddressAtom = atom<`0x${string}` | undefined>();
export const balanceAtom = atom<number | undefined>();
export const userIdAtom = atom<string | undefined>();
export const usernameAtom = atom<string | undefined>();
export const usdBalanceAtom = atom<number | undefined>((get) => {
  const balance = get(balanceAtom);
  return balance === undefined ? undefined : getPrice(balance);
});
export const sufficientBalanceForWithdrawalsAtom = atom((get) => {
  const usdBalance = get(usdBalanceAtom);
  return usdBalance !== undefined && usdBalance >= MINIMUM_USD_WITHDRAWAL;
});
