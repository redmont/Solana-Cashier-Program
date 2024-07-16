import { FC } from 'react';
import dayjs from 'dayjs';
import { useCountdown } from '@/hooks';

export interface CountdownProps {
  targetDateTime: number | string;
}

export const WidgetCountdown: FC<CountdownProps> = ({ targetDateTime }) => {
  const msLeft = useCountdown(targetDateTime);

  const duration = dayjs.duration(msLeft, 'milliseconds');

  const countdownSeconds = duration.get('seconds');
  const countdownMinutes = duration.get('minutes');
  const countdownHours = duration.get('hours');
  const countdownDays = duration.get('days');

  return (
    <div className="widget-countdown">
      {countdownDays > 0 && <span>{countdownDays}d</span>}
      <span>{countdownHours.toString().padStart(2, '0')}h</span>
      <span>{countdownMinutes.toString().padStart(2, '0')}m</span>
      <span>{countdownSeconds.toString().padStart(2, '0')}s</span>
    </div>
  );
};
