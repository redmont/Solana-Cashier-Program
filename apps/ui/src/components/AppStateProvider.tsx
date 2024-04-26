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
import { useEthWallet } from './web3';

export interface Bet {
  placer: string;
  amount: number;
}

export interface AppStateContextValue {
  ownedPoints: number;
  bets: Record<Fighter, Bet[]>;
  currentBets: Partial<Record<Fighter, number>> | null;
  totalBets: Record<Fighter, number>;
  placeBet: (fighter: Fighter, bet: number) => void;
}

const AppStateContext = createContext<AppStateContextValue>({
  bets: { doge: [], pepe: [] },
  ownedPoints: 0,
  currentBets: {},
  totalBets: { doge: 0, pepe: 0 },
  placeBet: () => {},
});

export const AppStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [ownedPoints, setOwnedPoints] = useState(1000);

  const { address } = useEthWallet();

  const [bets, setBets] = useState<Record<Fighter, Bet[]>>({
    doge: [],
    pepe: [],
  });

  const [currentBets, setCurrentBets] = useState<Partial<
    Record<Fighter, number>
  > | null>(null);

  const placeBet = (fighter: Fighter, bet: number) => {
    setCurrentBets({
      ...(currentBets ?? {}),
      [fighter]: (currentBets?.[fighter] ?? 0) + bet,
    });

    const fighterBets = [
      ...bets[fighter],
      {
        placer: address,
        amount: bet,
      },
    ];

    setBets({
      ...bets,
      [fighter]: fighterBets,
    });
  };

  const totalBets = useMemo(() => {
    const result: Record<Fighter, number> = { doge: 0, pepe: 0 };

    Object.entries(bets).forEach(([fighter, betPoints]) => {
      result[fighter as Fighter] = betPoints.reduce(
        (sum, b) => sum + b.amount,
        0,
      );
    });

    return result;
  }, [bets]);

  return (
    <AppStateContext.Provider
      value={{ bets, ownedPoints, totalBets, currentBets, placeBet }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export function useAppState() {
  return useContext(AppStateContext);
}
