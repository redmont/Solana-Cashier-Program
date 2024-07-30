import React from 'react';
import Typography from '@/components/ui/typography';

import { GetMatchHistoryMessageResponse } from '@/interfaces';

interface MatchHistoryWithTitle extends GetMatchHistoryMessageResponse {
  title?: string;
  data: any;
  show: 'first' | 'last' | 'all';
}

interface PlayerData {
  codeName: string;
  betCount: number;
  ticker: string;
  imagePath: string;
  displayName: string;
  imageUrl: string;
}

interface FighterProps {
  fighter: PlayerData;
  winner?: PlayerData | undefined;
}

const Fighter: React.FC<FighterProps> = ({ fighter, winner }) => {
  const { imageUrl, displayName, codeName } = fighter;

  if (!imageUrl && !displayName) {
    return null;
  }

  const isWin = winner?.codeName === codeName;

  return (
    <div
      className={
        winner
          ? `fight-list-fighter ${isWin ? 'win' : 'loss'}`
          : `fight-list-fighter`
      }
    >
      <div className="fight-list-fighter-avatar">
        <img src={imageUrl} alt={displayName} />
      </div>
      <div className="fight-list-fighter-title">{displayName}</div>
    </div>
  );
};

export const FightFixturesList: React.FC<MatchHistoryWithTitle> = ({
  title,
  data,
  show,
}) => {
  let filteredData;

  switch (show) {
    case 'first':
      filteredData = data.slice(0, 1);
      break;
    case 'last':
      filteredData = data.slice(-1);
      break;
    case 'all':
      filteredData = data;
      break;
    default:
      filteredData = data;
      break;
  }

  return (
    <div className="fight-list">
      <Typography variant="header-secondary">{title}</Typography>
      <div className="fight-list-wrapper">
        {filteredData.map(
          (
            fight: { fighters: any[]; winner: PlayerData },
            index: React.Key | null | undefined,
          ) => (
            <div className="fight-list-item" key={index}>
              {fight.fighters.map(
                (
                  fighter: PlayerData,
                  fighterIndex: React.Key | null | undefined,
                ) => (
                  <Fighter
                    key={fighterIndex}
                    fighter={fighter}
                    winner={fight.winner}
                  />
                ),
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
};
