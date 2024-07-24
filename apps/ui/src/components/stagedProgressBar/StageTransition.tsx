import { FC } from 'react';
import { classNames } from 'primereact/utils';
import { State } from './states';

export interface StageTransitionProps {
  progress: number;
  state: State;
}

export const StageTransition: FC<StageTransitionProps> = ({
  progress,
  state,
}) => {
  return (
    <div className="stage-transition-box">
      <div className={classNames('stage-transition', state)}>
        <div
          className="stage-progress"
          style={{ width: `${(progress || 0) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
