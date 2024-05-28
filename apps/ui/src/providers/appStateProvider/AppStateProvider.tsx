import { createContext, FC, PropsWithChildren, useContext } from 'react';

import { useMatchInfo, MatchInfo } from './useMatchInfo';
import { useBalanceState } from './useBalanceState';

export type { MatchInfo };

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
