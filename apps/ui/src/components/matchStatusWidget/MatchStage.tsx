import { FC } from 'react';
import { classNames } from 'primereact/utils';

import { MatchStatus } from '@/types';
import { useAppState } from '@/hooks';
import { matchStatusSequence } from './matchStatusSequence';

export interface MatchStatusBoxProps {
  order: number;
  pastLabel: string;
  currentLabel: string;
  futureLabel: string;
}

export const MatchStage: FC<MatchStatusBoxProps> = ({ order, ...props }) => {
  const { match } = useAppState();

  const matchStage = matchStatusSequence.indexOf(
    match?.status ?? MatchStatus.Unknown,
  );

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
