import React, { FC } from 'react';

import { Stage } from './Stage';
import { StageTransition } from './StageTransition';
import { Scrollable } from '@/components/Scrollable';

export interface StagedProgressBarProps {
  stages: React.ReactNode[];
  currentStage: number;
  progress: number;
}
export const StagedProgressBar: FC<StagedProgressBarProps> = ({
  stages,
  currentStage,
  progress,
}) => {
  return (
    <div className="staged-progress-bar">
      <Scrollable>
        <div className="staged-progress-bar-body">
          {stages.map((stage, index) => {
            const isCurrentStage = index === currentStage;
            const isLastStage = index === stages.length - 1;
            const state = isCurrentStage
              ? 'current'
              : index < currentStage
                ? 'past'
                : 'future';
            const transitionProgress = isCurrentStage ? progress : 0;
            return (
              <div
                key={`stage-${index}`}
                ref={(el) => {
                  isCurrentStage &&
                    el?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                      inline: 'center',
                    });
                }}
                className='day-box-bar'
              >
                <div className={`day-box ${isLastStage ? "flag-box" : ""}`}>
                  <Stage state={state}>
                    {isCurrentStage ? `Day ${stage}` : stage}
                  </Stage>
                  {isCurrentStage && (
                    <StageTransition
                      key={`transition-${index}`}
                      state={state}
                      progress={transitionProgress}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Scrollable>
    </div>
  );
};
