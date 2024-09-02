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
        {false && (
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
                        <p className="place">#{currentUserItem?.rank}</p>
                        <p className="text">Your position in the leaderboard</p>
                      </div>
                      <div className="right-side">
                        <p className="text">24h Net Wins</p>
                        <p className="place">{currentUserItem?.winAmount}</p>
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
                          <p className="place">#{currentUserItem?.rank}</p>
                          <p className="text">
                            Your position in the leaderboard
                          </p>
                        </div>
                        <div className="right-side">
                          <p className="place">{currentUserItem?.winAmount}</p>
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
                        <p className="place">#{currentUserItem?.rank}</p>
                        <p className="text">Your position in the leaderboard</p>
                      </div>
                      <div className="right-side">
                        <p className="text">Total XP</p>
                        <p className="place">{currentUserItem?.xp}</p>
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
                          Earn <span className="xp">1 XP</span>&nbsp;for every
                          100 Credits won.
                        </p>
                      </div>
                    </div>

                    {currentUserItem?.xp && (
                      <div className="rank-position-panel-mobile">
                        <div className="left-side">
                          <p className="place">#{currentUserItem?.rank}</p>
                          <p className="text">
                            Your position in the leaderboard
                          </p>
                        </div>
                        <div className="right-side">
                          <p className="place">{currentUserItem?.xp}</p>
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
        )}
        <div className="normal-view">
          <div className="panel-list">
            <div className="widget-header-section">
              <div className="text-2xl">Tournament Leaderboard</div>
            </div>
            <div className="widget-header-section">
              <div className="flex items-center gap-2">
                <p>
                  Earn <span className="text-primary">1 XP</span>&nbsp;for every
                  <span className="text-primary">&nbsp;10,000 credits</span>
                  &nbsp;staked at risk.
                </p>
                <Tooltip
                  content={
                    <p className="max-w-80 rounded-xl border border-[#F0AC5D] bg-foreground p-2 text-center text-sm">
                      e.g. Stake 10k Credits on Fighter A and 20k Credits on
                      Fighter B = (20k - 10k = 10k = 1 XP)
                    </p>
                  }
                >
                  <div>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.50016 0.581787C12.8733 0.581787 16.4184 4.12687 16.4184 8.50004C16.4184 12.8724 12.8733 16.4167 8.50016 16.4167C4.127 16.4167 0.583496 12.8724 0.583496 8.50004C0.582705 4.12687 4.127 0.581787 8.50016 0.581787ZM8.50016 1.76929C7.61018 1.75963 6.72712 1.92659 5.90209 2.26049C5.07706 2.5944 4.32644 3.08862 3.69369 3.71454C3.06093 4.34047 2.5586 5.08568 2.21577 5.90705C1.87294 6.72841 1.69642 7.60961 1.69642 8.49964C1.69642 9.38968 1.87294 10.2709 2.21577 11.0922C2.5586 11.9136 3.06093 12.6588 3.69369 13.2847C4.32644 13.9107 5.07706 14.4049 5.90209 14.7388C6.72712 15.0727 7.61018 15.2397 8.50016 15.23C10.2725 15.2108 11.9658 14.4932 13.2123 13.2331C14.4588 11.973 15.1579 10.2721 15.1579 8.49964C15.1579 6.72718 14.4588 5.02626 13.2123 3.76616C11.9658 2.50606 10.2725 1.78851 8.50016 1.76929ZM8.497 7.31096C8.64061 7.31077 8.77943 7.36264 8.88773 7.45697C8.99603 7.55129 9.06647 7.68167 9.086 7.82396L9.09154 7.90471L9.09471 12.2605C9.09625 12.412 9.03981 12.5583 8.93695 12.6696C8.83409 12.7808 8.69259 12.8485 8.54143 12.8589C8.39027 12.8692 8.24088 12.8213 8.12385 12.7251C8.00683 12.6289 7.93102 12.4915 7.91196 12.3412L7.90721 12.2612L7.90404 7.9055C7.90404 7.74802 7.96659 7.597 8.07794 7.48565C8.18929 7.3743 8.34032 7.31175 8.49779 7.31175M8.50175 4.54329C8.60766 4.53994 8.71317 4.5579 8.812 4.59612C8.91083 4.63434 9.00098 4.69202 9.07708 4.76576C9.15319 4.83949 9.2137 4.92777 9.25502 5.02534C9.29635 5.12292 9.31764 5.2278 9.31764 5.33377C9.31764 5.43973 9.29635 5.54462 9.25502 5.64219C9.2137 5.73977 9.15319 5.82804 9.07708 5.90178C9.00098 5.97551 8.91083 6.0332 8.812 6.07142C8.71317 6.10963 8.60766 6.1276 8.50175 6.12425C8.29643 6.11775 8.1017 6.03162 7.95876 5.88408C7.81582 5.73655 7.73589 5.53919 7.73589 5.33377C7.73589 5.12835 7.81582 4.93098 7.95876 4.78345C8.1017 4.63592 8.29643 4.54979 8.50175 4.54329Z"
                        fill="#FEFEFE"
                        fill-opacity="0.6"
                      />
                    </svg>
                  </div>
                </Tooltip>
              </div>
            </div>

            {currentUserItem?.xp && (
              <div className="rank-position-panel">
                <div className="left-side">
                  <p className="place">#{currentUserItem?.rank}</p>
                  <p className="text">Your position in the leaderboard</p>
                </div>
                <div className="right-side">
                  <p className="text">Total XP</p>
                  <p className="place">{currentUserItem?.xp}</p>
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
                <div className="flex items-center gap-2">
                  <p>
                    Earn <span className="text-primary">1 XP</span>&nbsp;for
                    every
                    <span className="text-primary">&nbsp;10,000 credits</span>
                    &nbsp;staked at risk.
                  </p>
                  <Tooltip
                    content={
                      <p className="max-w-80 rounded-xl border border-[#F0AC5D] bg-foreground p-2 text-center text-sm">
                        e.g. Stake 10k Credits on Fighter A and 20k Credits on
                        Fighter B = (20k - 10k = 10k = 1 XP)
                      </p>
                    }
                  >
                    <div>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.50016 0.581787C12.8733 0.581787 16.4184 4.12687 16.4184 8.50004C16.4184 12.8724 12.8733 16.4167 8.50016 16.4167C4.127 16.4167 0.583496 12.8724 0.583496 8.50004C0.582705 4.12687 4.127 0.581787 8.50016 0.581787ZM8.50016 1.76929C7.61018 1.75963 6.72712 1.92659 5.90209 2.26049C5.07706 2.5944 4.32644 3.08862 3.69369 3.71454C3.06093 4.34047 2.5586 5.08568 2.21577 5.90705C1.87294 6.72841 1.69642 7.60961 1.69642 8.49964C1.69642 9.38968 1.87294 10.2709 2.21577 11.0922C2.5586 11.9136 3.06093 12.6588 3.69369 13.2847C4.32644 13.9107 5.07706 14.4049 5.90209 14.7388C6.72712 15.0727 7.61018 15.2397 8.50016 15.23C10.2725 15.2108 11.9658 14.4932 13.2123 13.2331C14.4588 11.973 15.1579 10.2721 15.1579 8.49964C15.1579 6.72718 14.4588 5.02626 13.2123 3.76616C11.9658 2.50606 10.2725 1.78851 8.50016 1.76929ZM8.497 7.31096C8.64061 7.31077 8.77943 7.36264 8.88773 7.45697C8.99603 7.55129 9.06647 7.68167 9.086 7.82396L9.09154 7.90471L9.09471 12.2605C9.09625 12.412 9.03981 12.5583 8.93695 12.6696C8.83409 12.7808 8.69259 12.8485 8.54143 12.8589C8.39027 12.8692 8.24088 12.8213 8.12385 12.7251C8.00683 12.6289 7.93102 12.4915 7.91196 12.3412L7.90721 12.2612L7.90404 7.9055C7.90404 7.74802 7.96659 7.597 8.07794 7.48565C8.18929 7.3743 8.34032 7.31175 8.49779 7.31175M8.50175 4.54329C8.60766 4.53994 8.71317 4.5579 8.812 4.59612C8.91083 4.63434 9.00098 4.69202 9.07708 4.76576C9.15319 4.83949 9.2137 4.92777 9.25502 5.02534C9.29635 5.12292 9.31764 5.2278 9.31764 5.33377C9.31764 5.43973 9.29635 5.54462 9.25502 5.64219C9.2137 5.73977 9.15319 5.82804 9.07708 5.90178C9.00098 5.97551 8.91083 6.0332 8.812 6.07142C8.71317 6.10963 8.60766 6.1276 8.50175 6.12425C8.29643 6.11775 8.1017 6.03162 7.95876 5.88408C7.81582 5.73655 7.73589 5.53919 7.73589 5.33377C7.73589 5.12835 7.81582 4.93098 7.95876 4.78345C8.1017 4.63592 8.29643 4.54979 8.50175 4.54329Z"
                          fill="#FEFEFE"
                          fill-opacity="0.6"
                        />
                      </svg>
                    </div>
                  </Tooltip>
                </div>
              </div>

              {currentUserItem?.xp && (
                <div className="rank-position-panel-mobile">
                  <div className="left-side">
                    <p className="place">#{currentUserItem?.rank}</p>
                    <p className="text">Your position in the leaderboard</p>
                  </div>
                  <div className="right-side">
                    <p className="place">{currentUserItem?.xp}</p>
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
      </div>
    </div>
  );
};

export default LeaderboardWidget;
