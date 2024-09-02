import { FC } from 'react';
import { cn as classNames } from '@/lib/utils';
import { truncateEthAddress } from '@/utils';
import { LeaderboardRecord, LeaderboardProps } from '../leaderboardTypes';

export const LeaderboardTable: FC<LeaderboardProps> = ({
  records,
  tournamentValue,
}) => {
  return (
    <div className="leaderboard-table">
      <div className="table-body">
        {records.map((rec, i) => (
          <LeaderboardTableRow
            key={i}
            username={rec.username}
            walletAddress={rec.walletAddress}
            xp={rec.xp}
            rank={rec.rank}
            winAmount={rec.winAmount}
            value={tournamentValue?.[i]}
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
    })}
    key={props.walletAddress}
  >
    <div className={`col-rank rank-${props.rank}`}>
      <div className="rank-value">{props.rank}</div>
    </div>

    <div className="col-player">
      {props.username ?? truncateEthAddress(props.walletAddress)}
    </div>
    <div className="col-xp">{props.value}</div>
  </div>
);
