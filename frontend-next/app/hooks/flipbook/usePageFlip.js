'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const COMPLETION_THRESHOLD = 0.5;
const ANIMATION_MS = 380;

const reduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Drives the page-flip state machine. Tracks drag progress in the range
 * `[-1, 1]` (negative = flipping backward, positive = flipping forward),
 * and fires `onCommit` once the user crosses the completion threshold
 * and releases the pointer. The canvas reads `progress` and `direction`
 * to render the curl.
 *
 * @param {object} options
 * @param {number} options.pageIndex Current page index.
 * @param {number} options.totalPages Total page count.
 * @param {(direction: 1 | -1) => void} options.onCommit Called when a flip
 *   completes past the threshold. Use this to advance/rewind the page.
 * @returns {{
 *   progress: number,
 *   direction: 1 | -1,
 *   isDragging: boolean,
 *   bind: {
 *     onPointerDown: (e: React.PointerEvent) => void,
 *     onPointerMove: (e: React.PointerEvent) => void,
 *     onPointerUp: (e: React.PointerEvent) => void,
 *     onPointerCancel: (e: React.PointerEvent) => void,
 *     onKeyDown: (e: React.KeyboardEvent) => void,
 *   },
 * }}
 */
export function usePageFlip({ pageIndex, totalPages, onCommit }) {
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(null);
  const widthRef = useRef(1);
  const animFrameRef = useRef(0);

  const animateTo = useCallback((target, dir) => {
    if (reduceMotion()) {
      setProgress(target > COMPLETION_THRESHOLD ? 1 : 0);
      setDirection(dir);
      return;
    }
    cancelAnimationFrame(animFrameRef.current);
    const start = performance.now();
    const from = 0;
    const delta = target - from;
    const step = (now) => {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(from + delta * eased);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setProgress(target);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  const beginDrag = useCallback((clientX) => {
    startXRef.current = clientX;
    setIsDragging(true);
  }, []);

  const updateDrag = useCallback((clientX, containerWidth) => {
    if (startXRef.current == null || !containerWidth) return;
    const raw = (clientX - startXRef.current) / containerWidth;
    const clamped = Math.max(-1, Math.min(1, raw));
    setDirection(clamped < 0 ? -1 : 1);
    setProgress(Math.abs(clamped));
  }, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    if (progress > COMPLETION_THRESHOLD) {
      animateTo(1, direction);
      onCommit?.(direction);
    } else {
      animateTo(0, direction);
    }
    startXRef.current = null;
  }, [progress, direction, animateTo, onCommit]);

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  const bind = {
    onPointerDown: (event) => {
      if (event.button && event.button !== 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      widthRef.current = rect.width;
      beginDrag(event.clientX);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event) => {
      if (!isDragging) return;
      updateDrag(event.clientX, widthRef.current);
    },
    onPointerUp: (event) => {
      if (!isDragging) return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      endDrag();
    },
    onPointerCancel: (event) => {
      if (!isDragging) return;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      animateTo(0, direction);
      startXRef.current = null;
      setIsDragging(false);
    },
    onKeyDown: (event) => {
      if (event.key === 'ArrowLeft' && pageIndex > 0) {
        event.preventDefault();
        setDirection(-1);
        animateTo(1, -1);
        onCommit?.(-1);
      } else if (event.key === 'ArrowRight' && pageIndex < totalPages - 1) {
        event.preventDefault();
        setDirection(1);
        animateTo(1, 1);
        onCommit?.(1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setDirection(-1);
        animateTo(1, -1);
        onCommit?.(-1);
      } else if (event.key === 'End') {
        event.preventDefault();
        setDirection(1);
        animateTo(1, 1);
        onCommit?.(1);
      }
    },
  };

  return { progress, direction, isDragging, bind };
}
