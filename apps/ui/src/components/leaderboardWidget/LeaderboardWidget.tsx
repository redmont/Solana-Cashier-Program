'use client';

import { FC } from 'react';

import { LeaderboardSearchInput } from './LeaderboardSearchInput';
import { LeaderboardRecordList } from './leaderboardRecordList/LeaderboardRecordList';

import { LeaderboardWidgetProps } from './leaderboardTypes';
import { LeaderboardTable } from './leaderboardTable/LeaderboardTable';
import { WidgetCountdown } from '../widgetCountdown';

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = ({
  searchQuery,
  resetDateTime,
  records,
  onSearch,
}) => {
  return (
    <div className="widget leaderboard-widget">
      <div className="widget-header">
        <div className="widget-header-section">
          <div className="widget-title">Leaderboard</div>

          <WidgetCountdown targetDateTime={resetDateTime} />
        </div>

        <div className="widget-header-section">
          <div className="widget-info">
            <p>100 Credits bet = <span className="xp">1 XP</span>.</p>
            <p>
              Daily bonus XP for most 24hr net Credits won:<br />
              1st: <span className="xp">150 XP</span>,
              2nd: <span className="xp">100 XP</span>,
              3rd: <span className="xp">50 XP</span>,
              Top 100: <span className="xp">25 XP</span>
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
