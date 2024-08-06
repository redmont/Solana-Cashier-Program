import { Fighter } from '@/types';
import { atom } from 'jotai';
import { fighterBettingInformationAtom, fightersAtom } from './match';
import { calculateWinRate } from '@/utils';

export const selectedFighterIndexAtom = atom<number>(0);
export const betAmountAtom = atom<number>(0);
export const selectedFighterAtom = atom<Fighter | null>((get) => {
  const selected = get(selectedFighterIndexAtom);
  const fighters = get(fightersAtom);
  return fighters[selected] ?? null;
});

export const winningRatesWithBetAmountAtom = atom((get) => {
  const selectedFighterIndex = get(selectedFighterIndexAtom);
  const bettingInfos = get(fighterBettingInformationAtom);
  const betAmount = get(betAmountAtom);

  return bettingInfos.map((info, index, infos) => {
    const opponentTotal =
      infos[(index + 1) % 2]?.total +
      (selectedFighterIndex !== index ? betAmount : 0);
    const fighterTotal =
      info.total + (selectedFighterIndex === index ? betAmount : 0);

    return calculateWinRate(fighterTotal, opponentTotal);
  });
});
