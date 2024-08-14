import { atomWithStorage } from 'jotai/utils';

export const tutorialCompletedAtom = atomWithStorage<'no' | 'yes'>(
  'tutorial_complete',
  'no',
  undefined,
  { getOnInit: true },
);
