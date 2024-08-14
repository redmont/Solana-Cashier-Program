import { FC } from 'react';
import { cn as classNames } from '@/lib/utils';

import { matchStatusSequence } from './matchStatusSequence';
import { useAtomValue } from 'jotai';
import { matchStatusAtom } from '@/store/match';

export interface MatchStatusBoxProps {
  order: number;
  pastLabel: string;
  currentLabel: string;
  futureLabel: string;
}

export const MatchStage: FC<MatchStatusBoxProps> = ({ order, ...props }) => {
  const matchStatus = useAtomValue(matchStatusAtom);
  const matchStage = matchStatusSequence.indexOf(matchStatus);

  return (
    <div
      className={classNames('match-stage', {
        current: matchStage === order,
        past: matchStage > order,
      })}
    >
      {matchStage === order
        ? props.currentLabel
        : matchStage > order
          ? props.pastLabel
          : props.futureLabel}
    </div>
  );
};
