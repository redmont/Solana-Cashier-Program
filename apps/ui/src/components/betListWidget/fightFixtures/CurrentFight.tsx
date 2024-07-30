import { FC } from 'react';
import Typography from '@/components/ui/typography';
import { Tooltip } from '@/components/Tooltip';

interface Fighter {
  imageUrl: string;
  displayName: string;
}

interface Credit {
  total: number;
}

interface CurrentFightProps {
  fighters: Fighter[];
  credits: Credit[];
}

export const CurrentFight: FC<CurrentFightProps> = ({ fighters, credits }) => {
  return (
    <div className="current-fight">
      <div>
        <img
          className="current-fight-img"
          src={fighters[0]?.imageUrl}
          alt={fighters[0]?.displayName}
        />
        <Tooltip
          content={`Total global stakes in ${fighters[0]?.displayName}'s pool`}
        >
          <div className="bet-total">{credits[0]?.total || 0} Credits</div>
        </Tooltip>
      </div>
      <div className="current-fight-title-wrapper">
        <Typography variant="header-secondary">Current Fight</Typography>
        <Typography variant="header-secondary">{`${fighters[0]?.displayName} VS ${fighters[1]?.displayName}`}</Typography>
      </div>
      <div>
        <img
          className="current-fight-img"
          src={fighters[1]?.imageUrl}
          alt={fighters[1]?.displayName}
        />
        <Tooltip
          content={`Total global stakes in ${fighters[0]?.displayName}'s pool`}
        >
          <div className="bet-total">{credits[1]?.total || 0} Credits</div>
        </Tooltip>
      </div>
    </div>
  );
};
