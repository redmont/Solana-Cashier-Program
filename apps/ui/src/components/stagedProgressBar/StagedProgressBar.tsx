import React, { FC, useEffect, useRef } from 'react';

import { Stage } from './Stage';
import { StageTransition } from './StageTransition';
import { Scrollable } from '@/components/ui/scrollable';
import useElementInView from '@/hooks/useElementIntersected';

export interface StagedProgressBarProps {
  stages: React.ReactNode[];
  currentStage: number;
  progress: number;
  endDate: number;
}
export const StagedProgressBar: FC<StagedProgressBarProps> = ({
  stages,
  currentStage,
  progress,
  endDate,
}) => {
  const now = Date.now();
  const isEnded = now > endDate;

  const currentStageRef = useRef<HTMLDivElement>(null);
  const lastStageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const elementToScrollTo = isEnded
    ? lastStageRef.current
    : currentStageRef.current;
  const isInView = useElementInView(elementToScrollTo);

  useEffect(() => {
    if (!isInView) {
      setTimeout(() => {
        elementToScrollTo?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }, 500);
    }
  }, [currentStage, elementToScrollTo, isInView]);

  return (
    <div className="staged-progress-bar">
      <Scrollable>
        <div ref={containerRef} className="staged-progress-bar-body">
          {stages.map((stage, index) => {
            const isCurrentStage = currentStage === index && progress < 1;
            const isPastStage = index < currentStage || isEnded;
            const isLastStage = index === stages.length - 1;
            const state = isCurrentStage
              ? 'current'
              : index < currentStage
                ? 'past'
                : isLastStage && isEnded
                  ? 'flag-end'
                  : isLastStage
                    ? 'flag'
                    : isEnded
                      ? 'past'
                      : 'future';
            const transitionProgress = isCurrentStage ? progress : 0;
            return (
              <div key={`stage-${index}`} className="day-box-bar">
                <div
                  className="day-box"
                  ref={
                    isCurrentStage
                      ? currentStageRef
                      : isLastStage
                        ? lastStageRef
                        : undefined
                  }
                >
                  {isEnded ? (
                    <Stage state={state}>
                      {!isLastStage ? (
                        <div className="past-box-ended">
                          {stage} <img src="/check.svg" alt="check" />
                        </div>
                      ) : (
                        <div className="finished">
                          <p>Finished</p>
                          {stage}
                        </div>
                      )}
                    </Stage>
                  ) : (
                    <>
                      <Stage state={state}>
                        {isCurrentStage ? (
                          `Day ${stage}`
                        ) : isPastStage && !isLastStage ? (
                          <div className="past-box">
                            {stage} <img src="/check.svg" alt="check" />
                          </div>
                        ) : (
                          stage
                        )}
                      </Stage>
                      {isCurrentStage && (
                        <StageTransition
                          key={`transition-${index}`}
                          state={state}
                          progress={transitionProgress}
                        />
                      )}
                    </>
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
