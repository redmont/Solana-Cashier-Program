'use client';

import { ReactNode, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface DonutChartProps {
  size: number;
  progress: number;
  trackClassName?: string;
  progressClassName?: string;
  circleWidth?: number;
  progressWidth?: number;
  rounded?: boolean;
  className?: string;
  children?: ReactNode;
  textProp?: string;
}

export default function DonutChart({
  size,
  progress,
  progressClassName = 'text-green-500',
  trackClassName = 'text-black/10 dark:text-white/10',
  circleWidth = 16,
  progressWidth = 16,
  rounded = false,
  className,
  children,
  textProp,
}: DonutChartProps) {
  const [shouldUseValue, setShouldUseValue] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // This is a hack to force the animation to run for the first time.
      // We can use framer-motion to achieve this but just keeping it simple for now.
      setShouldUseValue(true);
    }, 250);
    return () => clearTimeout(timeout);
  }, []);

  const radius = size / 2 - Math.max(progressWidth, circleWidth) / 2;
  const circumference = Math.PI * radius * 2;
  const percentage = shouldUseValue
    ? circumference * ((100 - progress) / 100)
    : circumference;

  return (
    <div className={cn('relative', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'rotate(90deg)' }}
      >
        <circle
          r={radius + 6}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2px"
          className={cn('duration-500', progressClassName)}
        />
        <circle
          r={radius - 9}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2px"
          className={cn('duration-500', progressClassName)}
        />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={`${circleWidth}px`}
          strokeDasharray={'10px 0'}
          strokeDashoffset="0px"
          className={cn('duration-500', trackClassName)}
        />
        <circle
          r={radius - 2}
          cx={size / 2}
          cy={size / 2}
          stroke="currentColor"
          className={cn('duration-500', progressClassName)}
          strokeWidth={`${progressWidth}px`}
          strokeLinecap={rounded ? 'round' : 'butt'}
          fill="transparent"
          strokeDasharray={`${circumference}px`}
          strokeDashoffset={`${percentage}px`}
        />
      </svg>

      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 text-center font-bold leading-none text-white"
        // style={{ fontSize: size / 4 }}
      >
        <img src="/goldbrawler.svg" alt="" className="w-10" />
        {textProp}
      </div>
      {children}
    </div>
  );
}
