import { useCallback, useEffect, useState } from 'react';
import { useSocket } from '@/hooks';

import {
  GetFightersMessage,
  GetFightersMessageResponse,
} from '@bltzr-gg/brawlers-ui-gateway-messages';

export type FightersData = GetFightersMessageResponse['fighters'];

export function useFighterRosterData() {
  const { send, connected } = useSocket();
  const [fighters, setFighters] = useState<FightersData>([]);

  const getFightersData = useCallback(async () => {
    if (!connected) {
      return;
    }

    const resp = await send<GetFightersMessage, GetFightersMessageResponse>(
      new GetFightersMessage(),
    );

    const { success, fighters } = resp;

    if (success) {
      setFighters(fighters);
    }
  }, [connected, send]);

  useEffect(() => {
    if (connected) {
      getFightersData();
    }
  }, [connected, getFightersData]);

  return fighters;
}
