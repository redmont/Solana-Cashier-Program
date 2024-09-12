import { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { soundsOnAtom } from '@/store/app';

export function useSfx() {
  const soundsOn = useAtomValue(soundsOnAtom);

  const playSoundEffect = useCallback(
    (fileName: string) => {
      soundsOn && new Audio(`/sfx/${fileName}`).play();
    },
    [soundsOn],
  );

  const sfx = useMemo(
    () => ({
      stakePlaced: () => playSoundEffect('stake-placed.ogg'),
      stakeConfirmed: () => playSoundEffect('stake-confirmed.ogg'),
      poolOpen: () => {},
      fightStarts: () => {},
      pollPrices: () => {},
      sendMessage: () => {},
      tutorialOpen: () => {},
      stakeWon: () => {},
      stakeLost: () => {},
    }),
    [playSoundEffect],
  );

  return sfx;
}
