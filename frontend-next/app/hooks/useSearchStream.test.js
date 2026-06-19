import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

class FakeEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    FakeEventSource.lastInstance = this;
  }
  addEventListener(name, cb) {
    this.listeners[name] = cb;
  }
  close() {}
  trigger(name, data) {
    if (this.listeners[name]) this.listeners[name]({ data });
  }
}

global.EventSource = FakeEventSource;

import { useSearchStream } from './useSearchStream';

describe('useSearchStream', () => {
  beforeEach(() => {
    FakeEventSource.lastInstance = null;
  });

  it('opens an EventSource on the stream endpoint', () => {
    renderHook(() => useSearchStream('cosmos'));
    expect(FakeEventSource.lastInstance).toBeTruthy();
    expect(FakeEventSource.lastInstance.url).toBe('/api/search/stream?q=cosmos');
  });

  it('aggregates text + semantic events then done', () => {
    const { result } = renderHook(() => useSearchStream('q'));
    act(() => {
      FakeEventSource.lastInstance.trigger('text', JSON.stringify([{ id: 1 }]));
      FakeEventSource.lastInstance.trigger('semantic', JSON.stringify([{ id: 2 }]));
    });
    expect(result.current.text).toEqual([{ id: 1 }]);
    expect(result.current.semantic).toEqual([{ id: 2 }]);
    expect(result.current.status).toBe('partial');
    act(() => { FakeEventSource.lastInstance.trigger('done', '{}'); });
    expect(result.current.status).toBe('done');
  });

  it('handles text-degraded', () => {
    const { result } = renderHook(() => useSearchStream('q'));
    act(() => { FakeEventSource.lastInstance.trigger('text-degraded', '{}'); });
    expect(result.current.text).toEqual([]);
  });
});