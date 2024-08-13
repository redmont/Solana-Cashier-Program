import { FC } from 'react';
import { cn as classNames } from '@/lib/utils';
import { State } from './states';

export interface StageProps {
  children?: React.ReactNode;
  state: State;
}

export const Stage: FC<StageProps> = ({ children, state }) => {
  return (
    <div className={classNames('progress-bar-stage', state)}>{children}</div>
  );
};
