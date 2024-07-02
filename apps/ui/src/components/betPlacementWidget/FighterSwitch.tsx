import { Fighter } from '@/types';
import { classNames } from 'primereact/utils';
import { FC } from 'react';

interface FighterSwitchProps {
  fighters: Fighter[];
  selectedFighter?: Fighter;
  handleFighterChange: (index: number) => void;
}

export const FighterSwitch: FC<FighterSwitchProps> = ({
  fighters,
  selectedFighter,
  handleFighterChange,
}) => (
  <div className="fighter-switch">
    <div
      className={classNames('fighter-tile', {
        selected: selectedFighter?.codeName === fighters.at(0)?.codeName,
      })}
      onClick={() => handleFighterChange(0)}
    >
      <img src={fighters.at(0)?.imageUrl} />
      {fighters.at(0)?.displayName}
    </div>

    <span>VS</span>

    <div
      className={classNames('fighter-tile', {
        selected: selectedFighter?.codeName === fighters.at(1)?.codeName,
      })}
      onClick={() => handleFighterChange(1)}
    >
      {fighters.at(1)?.displayName}
      <img src={fighters.at(1)?.imageUrl} />
    </div>
  </div>
);
