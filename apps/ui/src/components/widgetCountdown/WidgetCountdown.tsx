import { FC, useMemo, useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

export interface CountdownProps {
  targetDateTime: number | string;
}

export const WidgetCountdown: FC<CountdownProps> = ({ targetDateTime }) => {
  const [countdownValue, setCountdownValue] = useState<number>(0);
  const coundownTimer = useRef<NodeJS.Timeout>();

  const targetDate = useMemo(
    () => dayjs(targetDateTime).valueOf(),
    [targetDateTime],
  );

  useEffect(() => {
    let timer = coundownTimer.current;

    if (timer) return;

    timer = coundownTimer.current = setInterval(() => {
      let timeLeft = targetDate ? dayjs(targetDate).diff().valueOf() : 0;

      if (timeLeft < 0) timeLeft = 0;

      setCountdownValue(Math.floor(timeLeft / 1000));
    }, 1000);

    return () => {
      timer && clearInterval(timer);
      coundownTimer.current = undefined;
    };
  }, [targetDate]);

  const countdownSeconds = countdownValue % 60;
  const countdownMinutes = Math.floor(countdownValue / 60) % 60;
  const countdownHours = Math.floor(countdownValue / 60 / 60) % 24;
  const countdownDays = Math.floor(countdownValue / 60 / 60 / 24);

  return (
    <div className="widget-countdown">
      {countdownDays > 0 && <span>{countdownDays}d</span>}
      <span>{countdownHours.toString().padStart(2, '0')}h</span>
      <span>{countdownMinutes.toString().padStart(2, '0')}m</span>
      <span>{countdownSeconds.toString().padStart(2, '0')}s</span>
    </div>
  );
};
