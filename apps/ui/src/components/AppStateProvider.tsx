import { Fighter } from '@/types';
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface AppStateContextValue {
  ownedPoints: number;
  currentBet: Partial<Record<Fighter, number>> | null;
  totalBets: Record<Fighter, number>;
  placeBet: (fighter: Fighter, bet: number) => void;
}

const AppStateContext = createContext<AppStateContextValue>({
  ownedPoints: 0,
  currentBet: {},
  totalBets: { doge: 0, pepe: 0 },
  placeBet: () => {},
});

export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [ownedPoints, setOwnedPoints] = useState(1000);

  const [bets, setBets] = useState<Record<Fighter, number[]>>({
    doge: [],
    pepe: [],
  });

  const [currentBet, setCurrentBet] = useState<Partial<
    Record<Fighter, number>
  > | null>(null);

  const placeBet = (fighter: Fighter, bet: number) => {
    setCurrentBet({
      ...(currentBet ?? {}),
      [fighter]: bet,
    });

    const fighterBets = [...bets[fighter], bet];

    setBets({
      ...bets,
      [fighter]: fighterBets,
    });
  };

  const totalBets = useMemo(() => {
    const result: Record<Fighter, number> = { doge: 0, pepe: 0 };

    Object.entries(bets).forEach(([fighter, betPoints]) => {
      result[fighter as Fighter] = betPoints.reduce((sum, p) => sum + p, 0);
    });

    return result;
  }, [bets]);

  return (
    <AppStateContext.Provider
      value={{ ownedPoints, totalBets, currentBet, placeBet }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState() {
  return useContext(AppStateContext);
}
