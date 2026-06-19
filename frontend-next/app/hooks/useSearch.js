'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchService } from '../lib/api';

/**
 * useSearch — debounced wrapper around searchService.unifiedSearch.
 *
 * Returns { data, loading, error, signals, run }.
 *   - run(q, opts) schedules a fetch after `debounceMs` of quiet
 *   - successive run() calls within the window reset the timer (debounce)
 *   - signals: { text: 'ok'|'degraded', semantic: 'ok'|'degraded' }
 */
export function useSearch({ debounceMs = 250 } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signals, setSignals] = useState({ text: 'ok', semantic: 'ok' });

  const timerRef = useRef(null);
  const requestIdRef = useRef(0);

  const run = useCallback((q, opts = {}) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = (q || '').trim();
    if (!trimmed) {
      setData(null);
      setError(null);
      setSignals({ text: 'ok', semantic: 'ok' });
      return;
    }
    timerRef.current = setTimeout(async () => {
      const myId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await searchService.unifiedSearch(trimmed, { source: opts.source, ...opts });
        if (myId !== requestIdRef.current) return; // a newer request superseded us
        setData(res.data);
        setSignals(res.data?.signals || { text: 'ok', semantic: 'ok' });
      } catch (e) {
        if (myId !== requestIdRef.current) return;
        setError(e);
        setData(null);
      } finally {
        if (myId === requestIdRef.current) setLoading(false);
      }
    }, debounceMs);
  }, [debounceMs]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { data, loading, error, signals, run };
}
