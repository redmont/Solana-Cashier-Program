import { OrderBook, StandardOrderBook } from '@/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface Fighter {
  displayName: string;
  imageUrl: string;
  fightCount: number;
  winningFightCount: number;
  wageredSum: number;
}

export const activeFighterRosterWidgetRow = atom(null as Fighter | null);

export const tutorialCompletedAtom = atomWithStorage<'no' | 'yes'>(
  'tutorial_complete',
  'no',
  undefined,
  { getOnInit: true },
);

export const orderBookAtom = atomWithStorage<OrderBook>(
  'order_book',
  StandardOrderBook,
  undefined,
  { getOnInit: true },
);

export enum ActiveWidget {
  MatchStreamWidget = 'MatchStreamWidget',
  BetListWidget = 'BetListWidget',
  ChatWidget = 'ChatWidget',
}

export const activeBlock = atom({
  activeWidget: ActiveWidget.BetListWidget,
});
