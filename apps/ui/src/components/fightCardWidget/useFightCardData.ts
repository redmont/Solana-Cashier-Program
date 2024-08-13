import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/hooks';

import {
  GetMatchHistoryMessage,
  GetRosterMessage,
  GetRosterMessageResponse,
  GetMatchHistoryMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { useAtomValue } from 'jotai';
import { fightersAtom, matchSeriesAtom } from '@/store/match';

export type RosterData = GetRosterMessageResponse['roster'];

export function useFightCardData() {
  const { send, connected } = useSocket();
  const matchSeries = useAtomValue(matchSeriesAtom);
  const fighters = useAtomValue(fightersAtom);
  const [previousFights, setPreviousFights] = useState<
    GetMatchHistoryMessageResponse['matches']
  >([]);
  const [roster, setRoster] = useState<RosterData>([]);

  const getMatchHistoryData = useCallback(async () => {
    if (!connected || !matchSeries || !fighters) {
      return;
    }

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
      setPreviousFights(filteredMatches);
    }
  }, [connected, matchSeries, fighters, send]);

  useEffect(() => {
    if (connected) {
      getMatchHistoryData();
    }
  }, [connected, getMatchHistoryData]);

  const getRosterData = useCallback(async () => {
    if (!connected) {
      return;
    }

    const resp = (await send(
      new GetRosterMessage(),
    )) as GetRosterMessageResponse;

    const { success, roster } = resp;

    if (success) {
      setRoster(roster);
    }
  }, [connected, send]);

  useEffect(() => {
    if (connected) {
      getRosterData();
    }
  }, [connected, getRosterData]);

  return { previousFights, roster };
}
