'use client';

import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import {
  GetTournamentMessage,
  GetTournamentMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useSocket } from '@/hooks';

import { LeaderboardSearchInput } from './LeaderboardSearchInput';
import { LeaderboardRecordList } from './leaderboardRecordList/LeaderboardRecordList';

import { LeaderboardRecord, LeaderboardWidgetProps } from './leaderboardTypes';
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
