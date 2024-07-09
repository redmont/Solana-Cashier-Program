import { FC } from 'react';
import { LeaderboardProps, LeaderboardRecord } from '../leaderboardTypes';
import { classNames } from 'primereact/utils';
import { truncateEthAddress } from '@/utils';

export const LeaderboardRecordList: FC<LeaderboardProps> = ({ records }) => {
  return (
    <div className="leaderboard-record-list">
      {records.map((rec, i) => (
        <LeaderboardRecordCard
          key={i}
          walletAddress={rec.walletAddress}
          xp={rec.xp}
          rank={i + 1}
          winAmount={rec.winAmount}
        />
      ))}
    </div>
  );
};

const LeaderboardRecordCard: FC<LeaderboardRecord> = (props) => {
  const walletAddress = truncateEthAddress(props.walletAddress);

  return (
    <div
      className={classNames('leaderboard-record-card', {
        winning: props.rank <= 3,
        highlighted: props.highlighted,
      })}
    >
      <div className="card-header">
        <div className="card-rank">12</div>
        {props.rank <= 3 && (
          <div className="card-top-rank">
            <img src={`/rank-${props.rank}.svg`} />
          </div>
        )}
        <div className="card-wallet">{walletAddress}</div>
      </div>

      <div className="card-stat-list">
        <div className="card-stat">
          <div className="card-stat-label">24h Net Wins:</div>
          <div className="card-stat-value">{props.winAmount}</div>
        </div>

        <div className="card-stat">
          <div className="card-stat-label">Total XP:</div>
          <div className="card-stat-value">{props.xp}</div>
        </div>
      </div>
    </div>
  );
};
