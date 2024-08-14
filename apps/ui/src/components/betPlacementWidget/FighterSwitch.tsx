import { selectedFighterAtom, selectedFighterIndexAtom } from '@/store/app';
import { fightersAtom } from '@/store/match';
import { useAtomValue, useSetAtom } from 'jotai';
import { cn as classNames } from '@/lib/utils';
import { FC } from 'react';

interface FighterSwitchProps {
  disabled: boolean;
}

export const FighterSwitch: FC<FighterSwitchProps> = ({ disabled }) => {
  const fighters = useAtomValue(fightersAtom);
  const setSelectedFighter = useSetAtom(selectedFighterIndexAtom);
  const selectedFighter = useAtomValue(selectedFighterAtom);

  const handleFighterClick = (index: number) => {
    if (!disabled) {
      setSelectedFighter(index);
    }
  };

  return (
    <div className="fighter-switch">
      <div
        className={classNames('fighter-tile', {
          selected: selectedFighter?.codeName === fighters.at(0)?.codeName,
          disabled: disabled,
        })}
        onClick={() => handleFighterClick(0)}
      >
        <img src={fighters.at(0)?.imageUrl} />
        {fighters.at(0)?.displayName}
      </div>

      <span>VS</span>

      <div
        className={classNames('fighter-tile', {
          selected: selectedFighter?.codeName === fighters.at(1)?.codeName,
          disabled: disabled,
        })}
        onClick={() => handleFighterClick(1)}
      >
        {fighters.at(1)?.displayName}
        <img src={fighters.at(1)?.imageUrl} />
      </div>
    </div>
  );
};
