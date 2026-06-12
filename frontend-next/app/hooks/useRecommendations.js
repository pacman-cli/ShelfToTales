'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

/**
 * Fetch a list of book recommendations from the ranking service.
 *
 * @param {object} options
 * @param {'for-you'|'mood'|'similar'} options.kind Which endpoint to call.
 * @param {string} [options.mood] Required when kind === 'mood'.
 * @param {number} [options.bookId] Required when kind === 'similar'.
 * @param {number} [options.limit=10] Maximum results.
 * @returns {{ items: Array, loading: boolean, error: string|null, reload: () => void }}
 */
export function useRecommendations({ kind, mood, bookId, limit = 10 } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!kind) {
      setLoading(false);
      return undefined;
    }
    let path;
    if (kind === 'for-you') {
      path = '/recommendations/for-you';
    } else if (kind === 'mood') {
      if (!mood) {
        setError('mood is required for mood recommendations');
        setLoading(false);
        return undefined;
      }
      path = `/recommendations/mood/${encodeURIComponent(mood)}`;
    } else if (kind === 'similar') {
      if (!bookId) {
        setError('bookId is required for similar recommendations');
        setLoading(false);
        return undefined;
      }
      path = `/recommendations/similar/${bookId}`;
    } else {
      setError(`unknown recommendation kind: ${kind}`);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    api
      .get(path, { params: { limit } })
      .then((response) => {
        if (cancelled) return;
        setItems(response.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load recommendations');
        setItems([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [kind, mood, bookId, limit, tick]);

  return { items, loading, error, reload: () => setTick((t) => t + 1) };
}
