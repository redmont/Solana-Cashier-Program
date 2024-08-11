import { FC } from 'react';
import { classNames } from 'primereact/utils';

export interface FighterInfo {
  codeName?: string;
  displayName: string;
  imageUrl: string;
}

export interface FightFixtureProps {
  fighters: FighterInfo[];
  winner?: { codeName: string };
}

export const FightFixture: FC<FightFixtureProps> = ({ fighters, winner }) => {
  return (
    <div className="fight-fixture">
      {fighters.map((fighter, index) => (
        <Fighter
          key={index}
          {...fighter}
          hasWinner={!!winner}
          winner={winner?.codeName === fighter.codeName}
        />
      ))}
    </div>
  );
};

interface FighterProps extends FighterInfo {
  winner?: boolean;
  hasWinner?: boolean;
}

export const Fighter: FC<FighterProps> = ({
  imageUrl,
  displayName,
  winner,
  hasWinner,
}) => {
  if (!imageUrl && !displayName) {
    return null;
  }

  return (
    <div
      className={classNames('fight-fixture-fighter', {
        win: hasWinner && winner,
        loss: hasWinner && !winner,
      })}
    >
      <div className="fight-fixture-fighter-avatar">
        <img src={imageUrl} alt={displayName} />
      </div>
      <div className="fight-fixture-fighter-title">{displayName}</div>
    </div>
  );
};
