'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export function useCountdown(targetDateTime: string | number | Dayjs) {
  const [countdownValue, setCountdownValue] = useState<number>(0);
  const coundownTimer = useRef<NodeJS.Timeout>();

  const updateValue = useCallback(() => {
    let msLeft = targetDateTime ? dayjs(targetDateTime).diff().valueOf() : 0;

    if (msLeft < 0) {
      msLeft = 0;
    }

    setCountdownValue(msLeft);
  }, [targetDateTime]);

  useEffect(() => {
    updateValue();
  }, [updateValue]);

  useEffect(() => {
    let timer = coundownTimer.current;

    if (timer) {
      return;
    }

    timer = coundownTimer.current = setInterval(updateValue, 1000);

    return () => {
      timer && clearInterval(timer);
      coundownTimer.current = undefined;
    };
  }, [updateValue]);

  return countdownValue;
}
