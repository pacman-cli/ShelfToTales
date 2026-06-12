import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

import api from '@/lib/api';
import { useRecommendations } from './useRecommendations';

describe('useRecommendations', () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it('fetches "for-you" recommendations on mount', async () => {
    const items = [{ bookId: 1, score: 0.9, reason: 'because' }];
    api.get.mockResolvedValueOnce({ data: items });
    const { result } = renderHook(() => useRecommendations({ kind: 'for-you' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith('/recommendations/for-you', { params: { limit: 10 } });
    expect(result.current.items).toEqual(items);
  });

  it('fetches mood recommendations when kind is mood', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    renderHook(() => useRecommendations({ kind: 'mood', mood: 'cozy' }));
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/recommendations/mood/cozy', { params: { limit: 10 } });
  });

  it('fetches similar books when kind is similar', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    renderHook(() => useRecommendations({ kind: 'similar', bookId: 42 }));
    await waitFor(() => expect(api.get).toHaveBeenCalled());
    expect(api.get).toHaveBeenCalledWith('/recommendations/similar/42', { params: { limit: 10 } });
  });

  it('returns an error state when the call fails', async () => {
    api.get.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useRecommendations({ kind: 'for-you' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.items).toEqual([]);
  });
});
