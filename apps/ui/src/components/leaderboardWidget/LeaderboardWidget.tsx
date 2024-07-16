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
          <div className="widget-title">Daily Leaderboard</div>

          <WidgetCountdown targetDateTime={resetDateTime} />
        </div>

        <div className="widget-header-section">
          <p className="widget-info">
            Every game played earns <span className="xp">+1 XP</span>. Compete
            to daily win XP bonuses.
          </p>

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
