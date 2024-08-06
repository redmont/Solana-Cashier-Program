import { FC } from 'react';
import { LeaderboardProps, LeaderboardRecord } from '../leaderboardTypes';
import { classNames } from 'primereact/utils';
import { truncateEthAddress } from '@/utils';

export const LeaderboardRecordList: FC<LeaderboardProps> = ({
  records,
  tournamentValue,
  winNamed,
}) => {
  return (
    <div className="leaderboard-record-list">
      {records.map((rec, i) => (
        <LeaderboardRecordCard
          key={i}
          walletAddress={rec.walletAddress}
          xp={rec.xp}
          rank={rec.rank}
          winAmount={rec.winAmount}
          username={rec.username}
          value={tournamentValue?.[i]}
          valueName={winNamed}
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
        <div className="card-rank">{props.rank}</div>
        {props.rank <= 3 && (
          <div className="card-top-rank">
            <img src={`/rank-${props.rank}.svg`} />
          </div>
        )}
        <div className="card-wallet">{props.username ?? walletAddress}</div>
      </div>

      <div className="card-stat-list">
        <div className="card-stat">
          <div className="card-stat-label">{props.valueName}</div>
          <div className="card-stat-value">{props.value}</div>
        </div>
      </div>
    </div>
  );
};
