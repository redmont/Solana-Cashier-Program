import { FC, useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';

import { MatchStatus } from '@/types';
import { useAppState } from '@/hooks';
import { MatchStage } from './MatchStage';
import { MatchStageTransition } from './MatchStageTransition';

const pricePollingStageDurationMs = 10 * 1000;

export const MatchProgress: FC = () => {
  const timer = useRef<NodeJS.Timeout>();
  const { match } = useAppState();
  const [timeLeft, setTimeLeft] = useState('0m : 00s');
  const [matchTime, setMatchTime] = useState('0m : 00s');
  const [progress, setProgress] = useState(0);
  const [statusTimestamp, setStatusTimestamp] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!match?.startTime || !match?.poolOpenStartTime) return;

    timer.current = setInterval(() => {
      const startTime = dayjs(match.startTime);
      const startTimeDiff = startTime.diff();

      if (match.status === MatchStatus.BetsOpen) {
        let millisLeft = startTimeDiff >= 0 ? startTimeDiff : 0;

        if (startTimeDiff < 0) millisLeft = 0;

        const poolOpenStartTime = dayjs(match.poolOpenStartTime);
        const durationMs = startTime.diff(poolOpenStartTime);

        const progress = Math.floor((1 - millisLeft / durationMs) * 100);

        const timeLeftVal = dayjs.duration(millisLeft).format('m[m] : ss[s]');

        setTimeLeft(timeLeftVal);
        setProgress(progress);
      }

      if (match.status === MatchStatus.PollingPrices) {
        const progress = Math.floor(
          (-startTimeDiff / pricePollingStageDurationMs) * 100,
        );

        setProgress(progress);
      }

      if (match.status === MatchStatus.InProgress) {
        const matchTimeVal = dayjs
          .duration(-startTimeDiff - pricePollingStageDurationMs)
          .format('m[m] : ss[s]');

        setMatchTime(matchTimeVal);
      }
    }, 1000);

    return () => clearInterval(timer.current);
  }, [
    match?.poolOpenStartTime,
    match?.startTime,
    match?.status,
    statusTimestamp,
  ]);

  useEffect(() => {
    const timestamp = dayjs().valueOf();

    setProgress(0);
    setStatusTimestamp(timestamp);

    const widgetBodyEl = rootRef.current;
    const stageEl = document.querySelector(`.match-stage.current`);

    if (!stageEl) {
      return widgetBodyEl?.scrollTo({ left: 0, behavior: 'smooth' });
    }

    const { left: containerX = 0 } =
      widgetBodyEl?.getBoundingClientRect() ?? {};

    const { x } = stageEl.getBoundingClientRect();

    return widgetBodyEl?.scrollTo({
      left: x - containerX + (widgetBodyEl?.scrollLeft ?? 0),
      behavior: 'smooth',
    });
  }, [match?.status]);

  return (
    <div ref={rootRef} className="match-progress">
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
