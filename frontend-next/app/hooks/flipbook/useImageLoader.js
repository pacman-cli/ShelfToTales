'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Cache Image instances so the canvas can redraw without re-decoding. We
 * pre-decode the current page plus a small window of neighbors so drag
 * gestures feel instant while keeping network and memory bounded.
 *
 * @param {Array<{image: string, width?: number, height?: number}>} pages
 *   Page payloads from the flipbook.
 * @param {number} currentIndex Active page index (zero-based).
 * @param {number} [radius=2] Pages to keep loaded on each side of the cursor.
 * @returns {{
 *   cache: Map<number, HTMLImageElement>,
 *   isPageReady: (index: number) => boolean,
 *   preloadAll: () => void,
 * }}
 */
export function useImageLoader(pages, currentIndex, radius = 2) {
  const cacheRef = useRef(new Map());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !Array.isArray(pages)) return undefined;

    const cache = cacheRef.current;
    const want = new Set();
    for (let i = currentIndex - radius; i <= currentIndex + radius; i += 1) {
      if (i >= 0 && i < pages.length) want.add(i);
    }

    pages.forEach((page, index) => {
      if (!page || !page.image) return;
      const inWindow = want.has(index);
      const have = cache.has(index);
      if (inWindow && !have) {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.alt = '';
        img.src = page.image;
        img.onload = () => setTick((t) => t + 1);
        img.onerror = () => setTick((t) => t + 1);
        cache.set(index, img);
      } else if (!inWindow && have && cache.size > radius * 4) {
        cache.delete(index);
      }
    });

    return undefined;
  }, [pages, currentIndex, radius]);

  useEffect(() => () => {
    cacheRef.current.clear();
  }, []);

  const isPageReady = (index) => {
    // `tick` participates so React re-renders when a fresh decode lands.
    void tick;
    const img = cacheRef.current.get(index);
    return Boolean(img && img.complete && img.naturalWidth > 0);
  };

  const preloadAll = () => {
    if (typeof window === 'undefined' || !Array.isArray(pages)) return;
    pages.forEach((page, index) => {
      if (!page || !page.image || cacheRef.current.has(index)) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = page.image;
      cacheRef.current.set(index, img);
    });
  };

  return { cache: cacheRef.current, isPageReady, preloadAll };
}
