import { getPrice } from '@/components/cashier/utils';
import { MINIMUM_USDC_WITHDRAWAL } from '@/config/withdrawals';
import { atom } from 'jotai';

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
