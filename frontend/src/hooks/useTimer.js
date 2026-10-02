import { useState, useEffect, useRef } from 'react';
import { getRemainingTime } from '../utils/timer';

export function useTimer(startTime, totalDurationSeconds = 1200, onExpire, isLocked = false) {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!startTime) return totalDurationSeconds;
    return getRemainingTime(startTime, totalDurationSeconds);
  });

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!startTime || isLocked) return;

    let interval = null;

    const tick = () => {
      const remaining = getRemainingTime(startTime, totalDurationSeconds);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    };

    tick();
    interval = setInterval(tick, 1000);
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startTime, totalDurationSeconds, isLocked]);

  const elapsedSeconds = Math.max(0, totalDurationSeconds - secondsRemaining);

  const timerState =
    secondsRemaining <= 0
      ? 'expired'
      : secondsRemaining <= 60
      ? 'critical'
      : secondsRemaining <= 300
      ? 'warning'
      : 'normal';

  return {
    seconds: secondsRemaining,
    secondsRemaining,
    elapsedSeconds,
    timerState,
    isExpired: secondsRemaining <= 0,
  };
}
