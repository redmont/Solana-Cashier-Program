import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/hooks';

import {
  GetFightersMessage,
  GetFightersMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';
import { formatCreditAmount } from '@/utils';

export interface FightersData {
  codeName: string;
  displayName: string;
  imageUrl: string;
  fightCount: number;
  winningFightCount: number;
  wageredSum: string;
}

export function useFighterRosterData() {
  const { send, connected } = useSocket();
  const [fighters, setFighters] = useState<FightersData[]>([]);

  const getFightersData = useCallback(async () => {
    if (!connected) {
      return;
    }

    const resp = await send<GetFightersMessage, GetFightersMessageResponse>(
      new GetFightersMessage(),
    );

    const { success, fighters } = resp;

    const fightersWithUsdWageredSums = fighters.map((fighter) => ({
      ...fighter,
      wageredSum: formatCreditAmount(fighter.wageredSum ?? 0),
    }));

    if (success) {
      setFighters(fightersWithUsdWageredSums);
    }
  }, [connected, send]);

  useEffect(() => {
    if (connected) {
      getFightersData();
    }
  }, [connected, getFightersData]);

  return fighters;
}
