import { FC } from 'react';
import { classNames } from 'primereact/utils';
import { truncateEthAddress } from '@/utils';
import { LeaderboardRecord, LeaderboardProps } from '../leaderboardTypes';

export const LeaderboardTable: FC<LeaderboardProps> = ({ records }) => {
  return (
    <div className="leaderboard-table">
      <div className="table-header">
        <div className="col-rank">Rank</div>
        <div className="col-player">Player</div>
        <div className="col-wins">24h Net Credit Wins</div>
        <div className="col-xp">Tournament XP</div>
      </div>

      <div className="table-body">
        {records.map((rec, i) => (
          <LeaderboardTableRow
            key={i}
            username={rec.username}
            walletAddress={rec.walletAddress}
            xp={rec.xp}
            rank={i + 1}
            winAmount={rec.winAmount}
          />
        ))}
      </div>
    </div>
  );
};

export const LeaderboardTableRow: FC<LeaderboardRecord> = (props) => (
  <div
    className={classNames('table-row', {
      highlighted: props.highlighted,
      winning: props.rank <= 3,
    })}
    key={props.walletAddress}
  >
    <div className={`col-rank rank-${props.rank}`}>
      <div className="rank-value">{props.rank}</div>

      {props.rank <= 3 && (
        <div className="rank-image">
          <img src={`/rank-${props.rank}.svg`} />
        </div>
      )}
    </div>

    <div className="col-player">{props.username ?? truncateEthAddress(props.walletAddress)}</div>
    <div className="col-wins">{props.winAmount}</div>
    <div className="col-xp">{props.xp}</div>
  </div>
);
