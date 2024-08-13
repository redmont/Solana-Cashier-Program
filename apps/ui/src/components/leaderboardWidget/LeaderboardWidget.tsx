'use client';

import dayjs from 'dayjs';
import { FC, useCallback, useMemo } from 'react';

import { LeaderboardSearchInput } from './LeaderboardSearchInput';
import { LeaderboardRecordList } from './leaderboardRecordList/LeaderboardRecordList';

import { LeaderboardWidgetProps } from './leaderboardTypes';
import { LeaderboardTable } from './leaderboardTable/LeaderboardTable';
import { StagedProgressBar } from '../stagedProgressBar';
import { getNormalizedTimeDifference } from '@/utils';
import { Tooltip } from '../Tooltip';
import { useCountdown } from '@/hooks';
import { TabPanel, TabView } from 'primereact/tabview';
import { Scrollable } from '@/components/ui/scrollable';
import { WidgetCountdown } from '../widgetCountdown';

const LeaderboardWidget: FC<LeaderboardWidgetProps> = ({
  searchQuery,
  startDateTime,
  endDateTime,
  currentRound,
  roundEndDate,
  records,
  currentUserItem,
  currentTab,
  onTabChange,
  onSearch,
}) => {
  const activeTab = useMemo(
    () => (currentTab === 'daily' ? 0 : 1),
    [currentTab],
  );

  const { tournamentDays } = useMemo(() => {
    const totalDays = dayjs(endDateTime).diff(dayjs(startDateTime), 'day');
    const tournamentDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    return { totalDays, tournamentDays };
  }, [startDateTime, endDateTime]);

  const countdown = useCountdown(roundEndDate);

  const duration = useMemo(
    () => dayjs.duration(countdown, 'milliseconds'),
    [countdown],
  );

  const endTimeEpoch = new Date(endDateTime).getTime();

  const handleTabChange = useCallback(
    ({ index }: { index: number }) => {
      onTabChange(index === 0 ? 'daily' : 'xp');
    },
    [onTabChange],
  );

  return (
    <div className="widget leaderboard-widget">
      <div className="widget-header">
        <TabView
          className="tab-view"
          activeIndex={activeTab}
          onTabChange={handleTabChange}
        >
          <TabPanel
            header="Daily Leaderboard"
            headerClassName="tab-header daily"
          >
            <div className="normal-view">
              <div className="panel-list">
                <div className="widget-header-section">
                  <div className="widget-title">Daily Leaderboard</div>
                </div>
                <div className="widget-header-section">
                  <div className="widget-info">
                    <p>
                      Daily bonus XP for most 24hr net Credits won:
                      <br />
                      1st: <span className="xp">150 XP</span>, 2nd:{' '}
                      <span className="xp">100 XP</span>, 3rd:{' '}
                      <span className="xp">50 XP</span>, Top 100:{' '}
                      <span className="xp">25 XP</span>
                    </p>
                  </div>
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
                    endDate={endTimeEpoch}
                  />
                </Tooltip>

                {currentUserItem?.winAmount && (
                  <div className="rank-position-panel">
                    <div className="left-side">
                      <p className="place">#{currentUserItem.rank}</p>
                      <p className="text">Your position in the leaderboard</p>
                    </div>
                    <div className="right-side">
                      <p className="text">24h Net Wins</p>
                      <p className="place">{currentUserItem.winAmount}</p>
                    </div>
                  </div>
                )}

                <div className="table-header">
                  <div className="inner-header-left">
                    <div className="col-rank">Rank</div>
                    <div className="col-player">Player</div>
                    <LeaderboardSearchInput
                      query={searchQuery}
                      onSearch={onSearch}
                    />
                  </div>
                  <div className="col-wins">24h Net Wins</div>
                </div>
              </div>
              <Scrollable className="panel">
                <div className="widget-body">
                  {records.length === 0 && (
                    <div className="empty-state">No records yet</div>
                  )}

                  {records.length > 0 && (
                    <>
                      <LeaderboardTable
                        records={records}
                        tournamentValue={records.map(
                          (record) => record.winAmount,
                        )}
                      />
                    </>
                  )}
                </div>
              </Scrollable>
            </div>
            <Scrollable className="panel mobile">
              <div>
                <div className="panel-list">
                  <div className="widget-header-section">
                    <div className="widget-info">
                      <p>
                        Daily bonus XP for most 24hr net Credits won:
                        <br />
                        1st: <span className="xp">150 XP</span>, 2nd:{' '}
                        <span className="xp">100 XP</span>, 3rd:{' '}
                        <span className="xp">50 XP</span>, Top 100:{' '}
                        <span className="xp">25 XP</span>
                      </p>
                    </div>
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
                      endDate={endTimeEpoch}
                    />
                  </Tooltip>

                  {currentUserItem?.winAmount && (
                    <div className="rank-position-panel-mobile">
                      <div className="left-side">
                        <p className="place">#{currentUserItem.rank}</p>
                        <p className="text">Your position in the leaderboard</p>
                      </div>
                      <div className="right-side">
                        <p className="place">{currentUserItem.winAmount}</p>
                        <p className="text">24h Net Wins</p>
                      </div>
                    </div>
                  )}

                  <div className="table-header mobile">
                    <LeaderboardSearchInput
                      query={searchQuery}
                      onSearch={onSearch}
                    />
                  </div>
                </div>
                <div className="widget-body">
                  {records.length === 0 && (
                    <div className="empty-state">No records yet</div>
                  )}

                  {records.length > 0 && (
                    <>
                      <LeaderboardRecordList
                        records={records}
                        tournamentValue={records.map(
                          (record) => record.winAmount,
                        )}
                        winNamed="24h Net Wins:"
                      />
                    </>
                  )}
                </div>
              </div>
            </Scrollable>
          </TabPanel>

          <TabPanel header="Tournament" headerClassName="tab-header">
            <div className="normal-view">
              <div className="panel-list">
                <div className="widget-header-section">
                  <div className="widget-title">Tournament Leaderboard</div>
                </div>
                <div className="widget-header-section">
                  <div className="widget-info">
                    <p>
                      Earn <span className="xp">1 XP</span>&nbsp;for every 100
                      Credits won.
                    </p>
                  </div>
                </div>

                {currentUserItem?.xp && (
                  <div className="rank-position-panel">
                    <div className="left-side">
                      <p className="place">#{currentUserItem.rank}</p>
                      <p className="text">Your position in the leaderboard</p>
                    </div>
                    <div className="right-side">
                      <p className="text">Total XP</p>
                      <p className="place">{currentUserItem.xp}</p>
                    </div>
                  </div>
                )}

                <div className="table-header">
                  <div className="inner-header-left">
                    <div className="col-rank">Rank</div>
                    <div className="col-player">Player</div>
                    <LeaderboardSearchInput
                      query={searchQuery}
                      onSearch={onSearch}
                    />
                  </div>
                  <div className="col-wins">Total XP</div>
                </div>
              </div>
              <Scrollable className="panel tournament">
                <div className="widget-body">
                  {records.length === 0 && (
                    <div className="empty-state">No records yet</div>
                  )}

                  {records.length > 0 && (
                    <LeaderboardTable
                      records={records}
                      tournamentValue={records.map((record) => record.xp)}
                    />
                  )}
                </div>
              </Scrollable>
            </div>

            <Scrollable className="panel mobile">
              <div>
                <div className="panel-list">
                  <div className="widget-header-section">
                    <div className="countdown-section">
                      <div>Ends in:</div>
                      <WidgetCountdown targetDateTime={endDateTime} />
                    </div>
                    <div className="widget-info">
                      <p>
                        Earn <span className="xp">1 XP</span>&nbsp;for every 100
                        Credits won.
                      </p>
                    </div>
                  </div>

                  {currentUserItem?.xp && (
                    <div className="rank-position-panel-mobile">
                      <div className="left-side">
                        <p className="place">#{currentUserItem.rank}</p>
                        <p className="text">Your position in the leaderboard</p>
                      </div>
                      <div className="right-side">
                        <p className="place">{currentUserItem.xp}</p>
                        <p className="text">Total XP</p>
                      </div>
                    </div>
                  )}

                  <div className="table-header mobile">
                    <LeaderboardSearchInput
                      query={searchQuery}
                      onSearch={onSearch}
                    />
                  </div>
                </div>
                <div className="widget-body">
                  {records.length === 0 && (
                    <div className="empty-state">No records yet</div>
                  )}

                  {records.length > 0 && (
                    <LeaderboardRecordList
                      records={records}
                      tournamentValue={records.map((record) => record.xp)}
                      winNamed="Total XP:"
                    />
                  )}
                </div>
              </div>
            </Scrollable>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default LeaderboardWidget;
