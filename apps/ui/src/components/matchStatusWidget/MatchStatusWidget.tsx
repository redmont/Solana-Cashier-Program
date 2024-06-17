import { FC, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { classNames } from 'primereact/utils';

import { MatchStatus } from '@/types';
import { useSocket, useAppState, usePostHog, useEthWallet } from '@/hooks';

const matchStages: MatchStatus[] = [
  MatchStatus.PendingStart,
  MatchStatus.BetsOpen,
  MatchStatus.PollingPrices,
  MatchStatus.InProgress,
  MatchStatus.Finished,
];

const pricePollingStageDurationMs = 10 * 1000;

export const MatchStatusWidget: FC = () => {
  const { match } = useAppState();
  const [timeLeft, setTimeLeft] = useState('00 : 00');
  const [matchTime, setMatchTime] = useState('00 : 00');
  const [progress, setProgress] = useState(0);
  const countdown = useRef<NodeJS.Timeout>();
  const [statusTimestamp, setStatusTimestamp] = useState(0);
  const stage = matchStages.indexOf(match?.status ?? MatchStatus.Unknown);

  useEffect(() => {
    if (!match?.startTime) return;

    countdown.current = setInterval(() => {
      const startTime = dayjs(match.startTime);
      const startTimeDiff = startTime.diff();

      if (match.status === MatchStatus.BetsOpen) {
        let millisLeft = startTimeDiff >= 0 ? startTimeDiff : 0;

        if (startTimeDiff < 0) millisLeft = 0;

        const durationMs = startTime.diff(statusTimestamp);

        const progress = Math.floor((1 - millisLeft / durationMs) * 100);

        const timeLeftVal = dayjs.duration(millisLeft).format('mm[m] : ss[s]');

        setTimeLeft(timeLeftVal);
        setProgress(progress);
      }

      if (match.status === MatchStatus.PollingPrices) {
        console.log(startTimeDiff, pricePollingStageDurationMs);

        const progress = Math.floor(
          (-startTimeDiff / pricePollingStageDurationMs) * 100,
        );

        setProgress(progress);
      }

      if (match.status === MatchStatus.InProgress) {
        const matchTimeVal = dayjs
          .duration(-startTimeDiff - pricePollingStageDurationMs)
          .format('mm[m] : ss[s]');

        setMatchTime(matchTimeVal);
      }
    }, 1000);

    return () => clearInterval(countdown.current);
  }, [match?.startTime, match?.status, statusTimestamp]);

  useEffect(() => {
    const timestamp = dayjs().valueOf();

    setProgress(0);
    setStatusTimestamp(timestamp);
  }, [match?.status]);

  return (
    <div className="widget match-status-widget">
      <div
        className={classNames('match-status-box', {
          current: stage === 1,
          past: stage > 1,
        })}
      >
        {stage === 1 ? `Pool Open ${timeLeft}` : 'Pool Closed'}
      </div>
      <div className="match-status-spacer">
        <div className="match-status-transition">
          <div
            className="match-status-progress"
            style={{ width: stage <= 1 ? `${progress}%` : '100%' }}
          ></div>
        </div>
      </div>
      <div
        className={classNames('match-status-box', {
          current: stage === 2,
          past: stage > 2,
        })}
      >
        {stage > 2 ? 'Prices Locked' : 'Fetching Prices'}
      </div>
      <div className="match-status-spacer">
        <div className="match-status-transition">
          <div
            className="match-status-progress"
            style={{
              width: stage < 2 ? 0 : stage === 2 ? `${progress}%` : '100%',
            }}
          ></div>
        </div>
      </div>
      <div
        className={classNames('match-status-box', {
          current: stage === 3,
          past: stage > 3,
        })}
      >
        {stage < 3
          ? 'Fight!'
          : stage === 3
            ? `Fight! ${matchTime}`
            : 'Finished'}
      </div>
    </div>
  );
};
