'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

const DEFAULT_DEBOUNCE_MS = 1500;

/**
 * Hydrates the user's last-read page from the backend on mount and
 * debounces writes so rapid page changes don't hammer the API.
 *
 * @param {object} options
 * @param {number|string} options.bookId Book the user is reading.
 * @param {number} [options.debounceMs=1500] Coalesce window for savePage.
 * @returns {{
 *   currentPage: number,
 *   totalPages: number,
 *   lastReadAt: string|null,
 *   loading: boolean,
 *   error: string|null,
 *   savePage: (page: number) => void,
 *   flush: () => Promise<void>,
 * }}
 */
export function useReadingProgress({ bookId, debounceMs = DEFAULT_DEBOUNCE_MS } = {}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [lastReadAt, setLastReadAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pendingRef = useRef(null);
  const timerRef = useRef(null);
  const inflightRef = useRef(null);

  // Fire-and-forget flush of the most-recent pending page. Used by the
  // debounce timer (via the setTimeout callback in savePage) and by the
  // unmount cleanup in the load effect below — both want the same PATCH
  // semantics, neither needs the response handling that the public flush()
  // provides. Declared before the effect that depends on it so the
  // dependency array captures a stable callback.
  const flushPending = useCallback(() => {
    const pendingPage = pendingRef.current;
    if (pendingPage == null || bookId == null) return;
    pendingRef.current = null;
    api
      .patch('/reading-progress', { currentPage: pendingPage }, { params: { bookId } })
      .catch(() => {});
  }, [bookId]);

  useEffect(() => {
    if (bookId == null) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get('/reading-progress', { params: { bookId } })
      .then((response) => {
        if (cancelled) return;
        const data = response.data || {};
        setCurrentPage(Number(data.currentPage) || 0);
        setTotalPages(Number(data.totalPages) || 0);
        setLastReadAt(data.lastReadAt || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load reading progress');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
      flushPending();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (inflightRef.current) inflightRef.current.abort?.();
    };
  }, [bookId, flushPending]);

  const flush = useCallback(() => {
    if (pendingRef.current == null) return Promise.resolve();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const page = pendingRef.current;
    pendingRef.current = null;
    return api
      .patch('/reading-progress', { currentPage: page }, { params: { bookId } })
      .then((response) => {
        const data = response.data || {};
        setCurrentPage(Number(data.currentPage) || page);
        setTotalPages(Number(data.totalPages) || 0);
        setLastReadAt(data.lastReadAt || null);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to save reading progress');
      });
  }, [bookId]);

  const savePage = useCallback(
    (page) => {
      if (bookId == null) return;
      if (!Number.isFinite(page) || page < 0) return;
      pendingRef.current = page;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        flushPending();
      }, debounceMs);
    },
    [bookId, debounceMs, flushPending]
  );

  return { currentPage, totalPages, lastReadAt, loading, error, savePage, flush };
}
