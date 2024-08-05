import { FC } from 'react';
import { classNames } from 'primereact/utils';

import { MatchStatus } from '@/types';
import { useAppState } from '@/hooks';
import { matchStatusSequence } from './matchStatusSequence';

export interface MatchStageTransitionProps {
  stage: number;
  progress: number;
}

export const MatchStageTransition: FC<MatchStageTransitionProps> = ({
  stage,
  ...props
}) => {
  const { match } = useAppState();

  const matchStage = matchStatusSequence.indexOf(
    match?.status ?? MatchStatus.Unknown,
  );

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
