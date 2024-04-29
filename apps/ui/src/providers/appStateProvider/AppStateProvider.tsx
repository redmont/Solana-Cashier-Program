import dayjs, { Dayjs } from 'dayjs';
import { Fighter, Bet } from '@/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useReducer,
} from 'react';
import { useEthWallet } from '../web3';
import { useSocket } from '../../providers/SocketProvider';

import {
  Message,
  PlaceBetMessage,
  GetBalanceMessage,
  GetMatchStatusMessage,
  GetActivityStreamMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  GatewayEvent,
  BalanceUpdatedEvent,
  ActivityStreamEvent,
  BetsUpdatedEvent,
} from 'ui-gateway-messages';
import { useMatchInfo, MatchInfo } from './useMatchInfo';
import { useBalanceState } from './useBalanceState';

export interface AppStateContextValue {
  balance: number;
  match?: MatchInfo | null;
}

export const AppStateContext = createContext<AppStateContextValue>({
  balance: 0,
  match: null,
});

export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const match = useMatchInfo();
  const { balance } = useBalanceState();

  return (
    <AppStateContext.Provider value={{ match, balance }}>
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState() {
  return useContext(AppStateContext);
}
