import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi } from './useApi';

describe('useApi', () => {
  it('starts in loading state', () => {
    const fetcher = vi.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useApi(fetcher));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets data on success', async () => {
    const fetcher = vi.fn(() => Promise.resolve({ data: 'hello' }));
    const { result } = renderHook(() => useApi(fetcher));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    const err = new Error('fail');
    const fetcher = vi.fn(() => Promise.reject(err));
    const { result } = renderHook(() => useApi(fetcher));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(err);
  });

  it('refetch re-invokes fetcher', async () => {
    let count = 0;
    const fetcher = vi.fn(() => Promise.resolve({ data: ++count }));
    const { result } = renderHook(() => useApi(fetcher));
    await waitFor(() => expect(result.current.data).toBe(1));
    await act(async () => { await result.current.refetch(); });
    expect(result.current.data).toBe(2);
  });
});
