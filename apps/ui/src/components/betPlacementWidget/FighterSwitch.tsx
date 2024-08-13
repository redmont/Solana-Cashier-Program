import { selectedFighterAtom, selectedFighterIndexAtom } from '@/store/app';
import { fightersAtom } from '@/store/match';
import { useAtomValue, useSetAtom } from 'jotai';
import { cn as classNames } from '@/lib/utils';
import { FC } from 'react';

export const FighterSwitch: FC = () => {
  const fighters = useAtomValue(fightersAtom);
  const setSelectedFighter = useSetAtom(selectedFighterIndexAtom);
  const selectedFighter = useAtomValue(selectedFighterAtom);

  return (
    <div className="fighter-switch">
      <div
        className={classNames('fighter-tile', {
          selected: selectedFighter?.codeName === fighters.at(0)?.codeName,
        })}
        onClick={() => setSelectedFighter(0)}
      >
        <img src={fighters.at(0)?.imageUrl} />
        {fighters.at(0)?.displayName}
      </div>

      <span>VS</span>

      <div
        className={classNames('fighter-tile', {
          selected: selectedFighter?.codeName === fighters.at(1)?.codeName,
        })}
        onClick={() => setSelectedFighter(1)}
      >
        {fighters.at(1)?.displayName}
        <img src={fighters.at(1)?.imageUrl} />
      </div>
    </div>
  );
};
