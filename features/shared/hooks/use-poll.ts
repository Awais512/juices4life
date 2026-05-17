"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UsePollOptions<T> {
  interval?: number;
  enabled?: boolean;
  onResult?: (data: T) => void;
  onError?: (error: Error) => void;
  refreshOnFocus?: boolean;
}

export function usePoll<T>(
  fetcher: () => Promise<T>,
  options: UsePollOptions<T> = {}
) {
  const {
    interval = 60000,
    enabled = true,
    onResult,
    onError,
    refreshOnFocus = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  fetcherRef.current = fetcher;
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoading(true);
    try {
      const result = await fetcherRef.current();
      if (!mountedRef.current) return;
      setData(result);
      setLoading(false);
      setError(null);
      onResultRef.current?.(result);
    } catch (err) {
      if (!mountedRef.current) return;
      setLoading(false);
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      onErrorRef.current?.(e);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    execute();

    intervalRef.current = setInterval(execute, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled, execute]);

  useEffect(() => {
    if (!refreshOnFocus || !enabled) return;

    function handleFocus() {
      execute();
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        execute();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshOnFocus, enabled, execute]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { data, loading, error, refresh: execute };
}
