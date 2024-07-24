'use client';

import dayjs from 'dayjs';
import { FC, useMemo } from 'react';

import { LeaderboardSearchInput } from './LeaderboardSearchInput';
import { LeaderboardRecordList } from './leaderboardRecordList/LeaderboardRecordList';

import { LeaderboardWidgetProps } from './leaderboardTypes';
import { LeaderboardTable } from './leaderboardTable/LeaderboardTable';
import { StagedProgressBar } from '../stagedProgressBar';
import { getNormalizedTimeDifference } from '@/utils';
import { Tooltip } from '../Tooltip';
import { useCountdown } from '@/hooks';

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = ({
  searchQuery,
  startDateTime,
  endDateTime,
  currentRound,
  roundEndDate,
  records,
  onSearch,
}) => {
  const { totalDays, tournamentDays } = useMemo(() => {
    const totalDays = dayjs(endDateTime).diff(dayjs(startDateTime), 'day');
    const tournamentDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    return { totalDays, tournamentDays };
  }, [startDateTime, endDateTime]);
  const countdown = useCountdown(roundEndDate);
  const duration = useMemo(
    () => dayjs.duration(countdown, 'milliseconds'),
    [countdown],
  );
  return (
    <div className="widget leaderboard-widget">
      <div className="widget-header">
        <div className="widget-header-section">
          <div className="widget-title">Leaderboard - Day {currentRound}</div>
        </div>
        <Tooltip
          content={`${duration.format(`HH[hr] mm[min] ss[sec]`)} left today`}
        >
          <StagedProgressBar
            stages={[
              ...tournamentDays,
              <div className="pi pi-flag-fill"></div>,
            ]}
            currentStage={currentRound - 1}
            progress={
              1 -
              getNormalizedTimeDifference({
                t1: dayjs(),
                t2: roundEndDate,
              })
            }
          />
        </Tooltip>
        <div className="widget-header-section">
          <div className="widget-info">
            <p>
              100 Credits bet = <span className="xp">1 XP</span>.
            </p>
            <p>
              Daily bonus XP for most 24hr net Credits won:
              <br />
              1st: <span className="xp">150 XP</span>, 2nd:{' '}
              <span className="xp">100 XP</span>, 3rd:{' '}
              <span className="xp">50 XP</span>, Top 100:{' '}
              <span className="xp">25 XP</span>
            </p>
          </div>

          <LeaderboardSearchInput query={searchQuery} onSearch={onSearch} />
        </div>
      </div>

      <div className="widget-body">
        {records.length === 0 && (
          <div className="empty-state">No records yet</div>
        )}

        {records.length > 0 && (
          <>
            <LeaderboardRecordList records={records} />
            <LeaderboardTable records={records} />
          </>
        )}
      </div>
    </div>
  );
};
