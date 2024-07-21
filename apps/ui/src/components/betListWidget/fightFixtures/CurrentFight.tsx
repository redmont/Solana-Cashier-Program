import { FC } from 'react';
import Typography from '@/components/ui/typography';

interface Fighter {
  imageUrl: string;
  displayName: string;
}

interface CurrentFightProps {
  fighters: Fighter[];
}

export const CurrentFight: FC<CurrentFightProps> = ({ fighters }) => {
  return (
    <div className="current-fight">
      <img
        className="current-fight-img"
        src={fighters[0]?.imageUrl}
        alt={fighters[0]?.displayName}
      />
      <div className="current-fight-title-wrapper">
        <Typography variant="header-secondary">Current Fight</Typography>
        <Typography variant="header-secondary">{`${fighters[0]?.displayName} VS ${fighters[1]?.displayName}`}</Typography>
      </div>
      <img
        className="current-fight-img"
        src={fighters[1]?.imageUrl}
        alt={fighters[1]?.displayName}
      />
    </div>
  );
};
