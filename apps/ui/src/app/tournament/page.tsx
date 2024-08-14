'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GetTournamentMessage,
  GetTournamentMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useSocket } from '@/hooks';

import { PrizesWidget } from '@/components/prizesWidget';
import { CreditClaimWidget } from '@/components/creditClaimWidget';
import { Scrollable } from '@/components/ui/scrollable';
import { cn as classNames } from '@/lib/utils';
import { LeaderboardIcon, RewardsIcon } from '@/icons';
import { ZealyWidget } from '@/components/zealyWidget';
import LeaderboardWidget from '@/components/leaderboardWidget/LeaderboardWidget';

type TournamentMobileTabName = 'leaderboard' | 'rewards';

export interface LeaderboardRecord {
  walletAddress: string;
  rank: number;
  highlighted?: boolean;
  xp?: string;
  winAmount?: string;
}

export default function Tournament() {
  const [currentMobileTab, setCurrentMobileTab] =
    useState<TournamentMobileTabName>('leaderboard');
  const [currentTab, setCurrentTab] = useState<'daily' | 'xp'>('daily');

  const { send, connected } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [tournament, setTournament] = useState<GetTournamentMessageResponse>();

  const getData = useCallback(
    async (type: 'winAmount' | 'xp', query?: string) => {
      if (!connected) {
        return;
      }

      const resp: GetTournamentMessageResponse = await send(
        new GetTournamentMessage(type, 100, 1, query),
      );

      setTournament(resp);
    },
    [connected, send],
  );

  useEffect(() => {
    getData('winAmount');
  }, [getData]);

  const leaderboardWidgetProps = useMemo(() => {
    if (!tournament) {
      return null;
    }

    const {
      items,
      currentUserItem = null,
      roundEndDate,
      endDate,
      startDate,
      currentRound,
    } = tournament ?? {};

    const records: LeaderboardRecord[] = items?.slice(0, 100) ?? [];

    return {
      records,
      currentUserItem,
      startDateTime: startDate,
      endDateTime: endDate,
      currentRound,
      roundEndDate: roundEndDate,
      searchQuery,
      currentTab,
      onTabChange: (tab: 'daily' | 'xp') => {
        setCurrentTab(tab);
        getData(tab === 'daily' ? 'winAmount' : 'xp');
      },
      onSearch: (query: string) => {
        setSearchQuery(query);
        getData(currentTab === 'daily' ? 'winAmount' : 'xp', query);
      },
    };
  }, [tournament, currentTab, setCurrentTab, searchQuery, getData]);

  const prizesWidgetProps = useMemo(() => {
    if (!tournament) {
      return null;
    }

    const { prizes = [], displayName, endDate } = tournament ?? {};

    return {
      prizes,
      endDateTime: endDate,
      title: displayName ?? '',
    };
  }, [tournament]);

  if (!tournament) {
    return null;
  }

  return (
    <main className={classNames('tournament-page', `tab-${currentMobileTab}`)}>
      {leaderboardWidgetProps && (
        <Scrollable className="tournament-page-section leaderboard-section">
          <LeaderboardWidget {...leaderboardWidgetProps} />
        </Scrollable>
      )}

      <Scrollable className="tournament-page-section rewards-section">
        {prizesWidgetProps && <PrizesWidget {...prizesWidgetProps} />}

        <CreditClaimWidget />
        <div className="tournament-page-section-inner">
          <ZealyWidget />
        </div>
      </Scrollable>

      <ul className="tournament-page-nav">
        <li
          className={classNames('tournament-page-nav-item', {
            active: currentMobileTab === 'leaderboard',
          })}
          onClick={() => setCurrentMobileTab('leaderboard')}
        >
          <div className="nav-item-icon">
            <LeaderboardIcon />
          </div>
          <div>Leaderboard</div>
        </li>

        <li
          className={classNames('tournament-page-nav-item', {
            active: currentMobileTab === 'rewards',
          })}
          onClick={() => setCurrentMobileTab('rewards')}
        >
          <div className="nav-item-icon">
            <RewardsIcon />
          </div>
          <span>Rewards</span>
        </li>
      </ul>
    </main>
  );
}
