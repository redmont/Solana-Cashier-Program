import { FC } from 'react';
import { cn as classNames } from '@/lib/utils';

import { matchStatusSequence } from './matchStatusSequence';
import { useAtomValue } from 'jotai';
import { matchStatusAtom } from '@/store/match';

export interface MatchStageTransitionProps {
  stage: number;
  progress: number;
}

export const MatchStageTransition: FC<MatchStageTransitionProps> = ({
  stage,
  ...props
}) => {
  const matchStatus = useAtomValue(matchStatusAtom);

  const matchStage = matchStatusSequence.indexOf(matchStatus ?? '');

  return (
    <div className="match-stage-transition-box">
      <div
        className={classNames('match-stage-transition', {
          current: matchStage === stage,
          past: matchStage > stage,
        })}
      >
        <div
          className="match-status-progress"
          style={{ width: matchStage === stage ? `${props.progress}%` : 0 }}
        ></div>
      </div>
    </div>
  );
};
