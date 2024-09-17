import { getPrice } from '@/components/cashier/utils';
import { MINIMUM_USDC_WITHDRAWAL } from '@/config/withdrawals';
import { atom } from 'jotai';

const isClient = typeof window !== 'undefined';
const fpRef =
  (isClient && new URLSearchParams(window.location.search).get('fp_ref')) ||
  (isClient && localStorage.getItem('fp_ref')) ||
  null;

if (fpRef) {
  localStorage.setItem('fp_ref', fpRef);
}

export const userReferrerAtom = atom<string | null>(
  () => (isClient && localStorage.getItem('fp_ref')) || null,
);
export const accountAddressAtom = atom<`0x${string}` | undefined>();
export const balanceAtom = atom<number | undefined>();
export const userIdAtom = atom<string | undefined>();
export const usernameAtom = atom<string | undefined>();
export const usdcBalanceAtom = atom<number | undefined>((get) => {
  const balance = get(balanceAtom);
  return balance === undefined ? undefined : getPrice(balance);
});
export const sufficientBalanceForWithdrawalsAtom = atom((get) => {
  const usdcBalance = get(usdcBalanceAtom);
  return usdcBalance !== undefined && usdcBalance >= MINIMUM_USDC_WITHDRAWAL;
});
