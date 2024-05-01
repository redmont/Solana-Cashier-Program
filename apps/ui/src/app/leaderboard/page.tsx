'use client';

import { FC } from 'react';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';

export default function Leaderboard() {
  return (
    <main className="leaderboard-page">
      <div className="leaderboard">
        <div className="header">
          <h1>Leaderboard</h1>

          <InputText />
        </div>

        <div className="body">
          <MobileRecord highlighted />
          <MobileRecord />
        </div>
      </div>
    </main>
  );
}

interface MobileRecordProps {
  highlighted?: boolean;
}

const MobileRecord: FC<MobileRecordProps> = ({ highlighted }) => {
  return (
    <div
      className={classNames('mobile-record', {
        highlighted,
      })}
    >
      <div className="mobile-record-body">
        <div className="rank">1</div>
        <div className="wallet">0xbfj5fZ...dbv3</div>
        <div className="points-label">Points:</div>
        <div className="points-value">3,214,765</div>
        <div className="winrate-label">Winrate:</div>
        <div className="winrate-value">96%</div>
      </div>
      <div className="mobile-record-footer">
        <div className="stat wins">
          <span className="stat-label">Wins:</span>
          <span className="stat-value">45</span>
        </div>
        <div className="stat losses">
          <span className="stat-label">Losses:</span>
          <span className="stat-value">2</span>
        </div>
      </div>
    </div>
  );
};
