'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GetTournamentMessage,
  GetTournamentMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useSocket } from '@/hooks';

import { LeaderboardWidget } from '@/components/leaderboardWidget';
import { PrizesWidget } from '@/components/prizesWidget';
import { ZealyWidget } from '@/components/zealyWidget';
import { XpQuestsWidget } from '@/components/xpQuestsWidget';
import { CreditClaimWidget } from '@/components/creditClaimWidget';
import { Scrollable } from '@/components/Scrollable';
import { classNames } from 'primereact/utils';
import { LeaderboardIcon, RewardsIcon } from '@/icons';

type TournamentTabName = 'leaderboard' | 'rewards';

export interface LeaderboardRecord {
  walletAddress: string;
  balance: string;
  rank: number;
  highlighted?: boolean;
  winAmount?: string;
}

export default function Tournament() {
  const [currentTab, setCurrentTab] =
    useState<TournamentTabName>('leaderboard');

  const { send, connected } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [tournament, setTournament] = useState<GetTournamentMessageResponse>();

  const getData = useCallback(
    async (query: string) => {
      if (!connected) return;

      const resp: GetTournamentMessageResponse = await send(
        new GetTournamentMessage(undefined, 100, 1, query),
      );

      setTournament(resp);
    },
    [connected, send],
  );

  useEffect(() => {
    getData('');
  }, [getData]);

  const leaderboardWidgetProps = useMemo(() => {
    if (!tournament) return null;

    const { items, currentUserItem = null, roundEndDate } = tournament ?? {};

    const records: LeaderboardRecord[] = items?.slice(0, 100) ?? [];

    const userRecord =
      currentUserItem &&
      records.find(
        (rec) => rec.walletAddress === currentUserItem.walletAddress,
      );

    if (userRecord) {
      userRecord.highlighted = true;
    }

    return {
      records,
      resetDateTime: roundEndDate,
      searchQuery,
      onSearch: (query: string) => {
        setSearchQuery(query);
        getData(query);
      },
    };
  }, [tournament, searchQuery, getData]);

  const prizesWidgetProps = useMemo(() => {
    if (!tournament) return null;

    const { prizes = [], displayName, endDate } = tournament ?? {};

    return {
      prizes,
      endDateTime: endDate,
      title: displayName ?? '',
    };
  }, [tournament]);

  if (!tournament) return null;

  return (
    <main className={classNames('tournament-page', `tab-${currentTab}`)}>
      {leaderboardWidgetProps && (
        <Scrollable className="tournament-page-section leaderboard-section">
          <LeaderboardWidget {...leaderboardWidgetProps} />
        </Scrollable>
      )}

      <Scrollable className="tournament-page-section rewards-section">
        {prizesWidgetProps && <PrizesWidget {...prizesWidgetProps} />}

        <CreditClaimWidget />

        {/* <div className="tournament-page-section-inner">
          <ZealyWidget />

          <XpQuestsWidget />
        </div> */}
      </Scrollable>

      <ul className="tournament-page-nav">
        <li
          className={classNames('tournament-page-nav-item', {
            active: currentTab === 'leaderboard',
          })}
          onClick={() => setCurrentTab('leaderboard')}
        >
          <div className="nav-item-icon">
            <LeaderboardIcon />
          </div>
          <div>Leaderboard</div>
        </li>

        <li
          className={classNames('tournament-page-nav-item', {
            active: currentTab === 'rewards',
          })}
          onClick={() => setCurrentTab('rewards')}
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
