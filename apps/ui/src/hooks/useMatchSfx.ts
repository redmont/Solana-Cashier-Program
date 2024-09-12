import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { matchStatusAtom } from '@/store/match';
import { MatchStatus } from '@/types';
import { useSfx } from '@/hooks';

export function useMatchSfx() {
  const [currentStatus, setCurrentStatus] = useState<MatchStatus>('');

  const matchStatus = useAtomValue(matchStatusAtom);
  const sfx = useSfx();

  useEffect(() => {
    if (currentStatus && currentStatus !== matchStatus) {
      if (matchStatus === 'bettingOpen') {
        sfx.poolOpen();
      } else if (matchStatus === 'pollingPrices') {
        sfx.pollPrices();
      } else if (matchStatus === 'matchInProgress') {
        sfx.fightStarts();
      }
    }

    setCurrentStatus(matchStatus);
  }, [matchStatus, currentStatus, sfx]);
}
