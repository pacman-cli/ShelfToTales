'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data-fetching hook. Accepts an async `fetcher` that must return
 * an object with a `.data` property (e.g. an Axios response).
 *
 * @param {() => Promise<{ data: any }>} fetcher  – the async function to call
 * @param {any[]} deps – dependency list forwarded to useCallback
 * @returns {{ data: any, loading: boolean, error: Error|null, refetch: () => Promise<void> }}
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}
