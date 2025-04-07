// src/hooks/useTokenRefresh.ts
import { useEffect, useRef } from 'react';

const useTokenRefresh = (refreshToken: () => void, intervalMs: number, shouldRefresh: boolean) => {
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!shouldRefresh) {
      // Clear interval if shouldRefresh is false
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
      return;
    }

    const startInterval = () => {
      if (intervalId.current) return;

      intervalId.current = setInterval(() => {
        refreshToken();
      }, intervalMs);
    };

    startInterval();

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, [refreshToken, intervalMs, shouldRefresh]);
};

export default useTokenRefresh;
