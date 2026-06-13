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
      if (timerRef.current) clearTimeout(timerRef.current);
      if (inflightRef.current) inflightRef.current.abort?.();
    };
  }, [bookId]);

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
        flush();
      }, debounceMs);
    },
    [bookId, debounceMs, flush]
  );

  return { currentPage, totalPages, lastReadAt, loading, error, savePage, flush };
}
