'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Wraps the Fullscreen API so consumers don't have to track element refs
 * and vendor prefixes manually. Works in all evergreen browsers.
 *
 * @param {React.RefObject<HTMLElement>} [targetRef] Optional element to
 *   fullscreen. When omitted, `document.documentElement` is used.
 * @returns {{
 *   isFullscreen: boolean,
 *   isSupported: boolean,
 *   enter: () => Promise<void>,
 *   exit: () => Promise<void>,
 *   toggle: () => Promise<void>,
 *   error: string|null,
 * }}
 */
export function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);

  const isSupported = typeof document !== 'undefined' && (
    typeof document.fullscreenEnabled === 'boolean'
      ? document.fullscreenEnabled
      : Boolean(document.documentElement.requestFullscreen)
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const enter = useCallback(async () => {
    if (!isSupported) {
      setError('Fullscreen not supported in this browser.');
      return;
    }
    try {
      const el = targetRef?.current || document.documentElement;
      await el.requestFullscreen();
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to enter fullscreen.');
    }
  }, [isSupported, targetRef]);

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch (err) {
      setError(err?.message || 'Failed to exit fullscreen.');
    }
  }, []);

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) {
      await exit();
    } else {
      await enter();
    }
  }, [enter, exit]);

  return { isFullscreen, isSupported, enter, exit, toggle, error };
}
