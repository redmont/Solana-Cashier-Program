import { FC, useCallback, useEffect, useState } from 'react';
import { CurrentFight } from './CurrentFight';
import { FightFixturesList } from './FightFixturesList';
import { useSocket, useAppState } from '@/hooks';

import {
  GetRosterMessage,
  GetMatchHistoryMessage,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import {
  GetRosterMessageResponse,
  GetMatchHistoryMessageResponse,
} from '@/interfaces';

interface RosterItem {
  series: string;
}

export const FightFixtures: FC = () => {
  const { match } = useAppState();
  const { series = '', fighters = [] } = match ?? {};
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [previousFight, setPreviousFight] = useState<
    GetMatchHistoryMessageResponse['matches']
  >([]);

  const { send, connected } = useSocket();

  const getRosterData = useCallback(async () => {
    if (!connected) return;

    const resp = (await send(
      new GetRosterMessage(),
    )) as GetRosterMessageResponse;

    const { success, roster } = resp;

    if (success) {
      setRoster(roster);
    }
  }, [connected, send]);

  const getMatchHistoryData = useCallback(async () => {
    if (!connected || !series || !fighters) return;

    const resp = (await send(
      new GetMatchHistoryMessage(fighters.map((i) => i.codeName)),
    )) as GetMatchHistoryMessageResponse;

    const { success, matches } = resp;

    if (success) {
      const filteredMatches = matches.filter(
        (match) => match.seriesCodeName === series,
      );
      setPreviousFight(filteredMatches);
    }
  }, [connected, send, series]);

  useEffect(() => {
    if (connected) {
      getRosterData();
    }
  }, [connected, getRosterData]);

  useEffect(() => {
    if (connected) {
      getMatchHistoryData();
    }
  }, [connected, series, getMatchHistoryData]);

  return (
    <div className="fight-fixtures-widget">
      <FightFixturesList
        data={roster}
        title="Up Next"
        success={false}
        matches={[]}
        show={'first'}
      />
      <CurrentFight fighters={fighters} />
      <FightFixturesList
        data={previousFight}
        title="Head-to-head"
        success={false}
        matches={[]}
        show={'all'}
      />
    </div>
  );
};
