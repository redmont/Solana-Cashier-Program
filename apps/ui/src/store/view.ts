import { atomWithStorage } from 'jotai/utils';

export const tutorialCompletedAtom = atomWithStorage<'no' | 'yes'>(
  'tutorial_complete',
  'no',
  undefined,
  { getOnInit: true },
);
import { atom } from 'jotai';

export enum ActiveWidget {
  MatchStreamWidget = 'MatchStreamWidget',
  BetListWidget = 'BetListWidget',
  ChatWidget = 'ChatWidget',
}

export const activeBlock = atom({
  activeWidget: ActiveWidget.BetListWidget,
});
