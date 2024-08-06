import { atom } from 'jotai';

export const accountAddressAtom = atom<`0x${string}` | undefined>();
export const balanceAtom = atom<number | undefined>();
