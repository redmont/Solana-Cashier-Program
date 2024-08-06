import { FC, useCallback, useEffect, useState } from 'react';
import { FightFixturesList } from './FightFixturesList';
import { useSocket } from '@/hooks';

import { GetMatchHistoryMessage } from '@bltzr-gg/brawlers-ui-gateway-messages';
import { GetMatchHistoryMessageResponse } from '@/interfaces';
import { useAtomValue } from 'jotai';
import { fightersAtom, matchSeriesAtom } from '@/store/match';

export const FightFixtures: FC = () => {
  const { send, connected } = useSocket();
  const matchSeries = useAtomValue(matchSeriesAtom);
  const fighters = useAtomValue(fightersAtom);
  const [previousFight, setPreviousFight] = useState<
    GetMatchHistoryMessageResponse['matches']
  >([]);

  const getMatchHistoryData = useCallback(async () => {
    if (!connected || !matchSeries || !fighters) return;

    const resp = (await send(
      new GetMatchHistoryMessage(
        fighters.map((fighter) => fighter?.codeName ?? ''),
      ),
    )) as GetMatchHistoryMessageResponse;

    const { success, matches } = resp;

    if (success) {
      const filteredMatches = matches.filter(
        (match) => match.seriesCodeName === matchSeries,
      );
      setPreviousFight(filteredMatches);
    }
  }, [connected, matchSeries, fighters, send]);

  useEffect(() => {
    if (connected) {
      getMatchHistoryData();
    }
  }, [connected, getMatchHistoryData]);

  return (
    <div className="fight-fixtures-widget">
      <FightFixturesList
        data={previousFight}
        success={false}
        matches={[]}
        show={'all'}
      />
    </div>
  );
};
