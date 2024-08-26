import { FC, useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

import { MatchStage } from './MatchStage';
import { MatchStageTransition } from './MatchStageTransition';
import { useAtomValue } from 'jotai';
import {
  matchStartTimeAtom,
  matchStatusAtom,
  poolOpenStartTimeAtom,
} from '@/store/match';

const pricePollingStageDurationMs = 10 * 1000;

export const MatchProgress: FC = () => {
  const timer = useRef<NodeJS.Timeout>();
  const matchStatus = useAtomValue(matchStatusAtom);
  const matchStartTime = useAtomValue(matchStartTimeAtom);
  const poolOpenStartTime = useAtomValue(poolOpenStartTimeAtom);

  const [timeLeft, setTimeLeft] = useState('0m : 00s');
  const [matchTime, setMatchTime] = useState('0m : 00s');
  const [progress, setProgress] = useState(0);
  const [statusTimestamp, setStatusTimestamp] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchStartTime || !poolOpenStartTime) {
      return;
    }

    timer.current = setInterval(() => {
      const startTime = dayjs(matchStartTime);
      const startTimeDiff = startTime.diff();

      if (matchStatus === 'bettingOpen') {
        let millisLeft = startTimeDiff >= 0 ? startTimeDiff : 0;

        if (startTimeDiff < 0) {
          millisLeft = 0;
        }

        const durationMs = startTime.diff(dayjs(poolOpenStartTime));

        const progress = Math.floor((1 - millisLeft / durationMs) * 100);

        const timeLeftVal = dayjs.duration(millisLeft).format('m[m] : ss[s]');

        setTimeLeft(timeLeftVal);
        setProgress(progress);
      }

      if (matchStatus === 'pollingPrices') {
        const progress = Math.floor(
          (-startTimeDiff / pricePollingStageDurationMs) * 100,
        );

        setProgress(progress);
      }

      if (matchStatus === 'matchInProgress') {
        const matchTimeVal = dayjs
          .duration(-startTimeDiff - pricePollingStageDurationMs)
          .format('m[m] : ss[s]');

        setMatchTime(matchTimeVal);
      }
    }, 1000);

    return () => clearInterval(timer.current);
  }, [matchStartTime, matchStatus, poolOpenStartTime, statusTimestamp]);

  useEffect(() => {
    const timestamp = dayjs().valueOf();
    setProgress(0);
    setStatusTimestamp(timestamp);

    const container = containerRef.current;
    const activeStage = container?.querySelector('.match-stage.current');

    if (container && activeStage) {
      setTimeout(() => {
        const containerWidth = container.offsetWidth;
        const activeStageLeft =
          activeStage.getBoundingClientRect().left -
          container.getBoundingClientRect().left;
        const activeStageWidth = (activeStage as HTMLElement).offsetWidth;
        const scrollLeft =
          activeStageLeft - containerWidth / 2 + activeStageWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }, 500);
    }
  }, [matchStatus]);

  return (
    <div ref={containerRef} className="match-progress">
      <MatchStage
        order={1}
        futureLabel="Pool Closed"
        currentLabel={`Pool Open ${timeLeft}`}
        pastLabel="Pool Closed"
      />

      <MatchStageTransition stage={1} progress={progress} />

      <MatchStage
        order={2}
        futureLabel="Prices Locked"
        currentLabel="Fetching Prices"
        pastLabel="Prices Locked"
      />

      <MatchStageTransition stage={2} progress={progress} />

      <MatchStage
        order={3}
        futureLabel="Fight!"
        currentLabel={`Fight! ${matchTime}`}
        pastLabel="Finished"
      />
    </div>
  );
};
