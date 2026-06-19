'use client';

import { useEffect, useState } from 'react';

/**
 * useSearchStream — subscribes to /api/search/stream and aggregates text + semantic events.
 *
 * Returns { text, semantic, done, error, status }.
 *   - status: 'connecting' | 'partial' | 'done' | 'error'
 *   - text, semantic: arrays of SearchHit objects (the same SearchHit shape the REST
 *     /api/search endpoint returns: { bookId, title, author, coverUrl, categoryName,
 *     price, score, matchedSources, semanticScore, textRank }).
 *     The semantic event's matchedSources is always ['semantic'].
 *   - done: boolean
 *   - error: object | null
 */
export function useSearchStream(q) {
  const [state, setState] = useState({
    text: null,
    semantic: null,
    done: false,
    error: null,
    status: 'connecting',
  });

  useEffect(() => {
    if (!q || !q.trim()) {
      setState({ text: null, semantic: null, done: false, error: null, status: 'connecting' });
      return undefined;
    }
    const es = new EventSource(`/api/search/stream?q=${encodeURIComponent(q.trim())}`);
    es.addEventListener('text', (e) => {
      setState((s) => ({ ...s, text: JSON.parse(e.data), status: 'partial' }));
    });
    es.addEventListener('semantic', (e) => {
      setState((s) => ({ ...s, semantic: JSON.parse(e.data), status: 'partial' }));
    });
    es.addEventListener('text-degraded', () => {
      setState((s) => ({ ...s, text: [], status: 'partial' }));
    });
    es.addEventListener('semantic-degraded', () => {
      setState((s) => ({ ...s, semantic: [], status: 'partial' }));
    });
    es.addEventListener('done', () => {
      setState((s) => ({ ...s, done: true, status: 'done' }));
      es.close();
    });
    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse(e.data);
        setState((s) => ({ ...s, error: data, status: 'error' }));
      } catch {
        setState((s) => ({ ...s, error: { message: 'stream error' }, status: 'error' }));
      }
      es.close();
    });
    return () => es.close();
  }, [q]);

  return state;
}