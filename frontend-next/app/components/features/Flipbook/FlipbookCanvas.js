'use client';

import { useEffect, useRef } from 'react';
import { usePageFlip } from '@/hooks/flipbook/usePageFlip';
import { useImageLoader } from '@/hooks/flipbook/useImageLoader';

const FILL_BG = '#525659';
const PAPER = '#fafaf6';
const SHADOW = 'rgba(0, 0, 0, 0.25)';

function drawBase(ctx, img, width, height) {
  ctx.fillStyle = FILL_BG;
  ctx.fillRect(0, 0, width, height);
  if (!img || !img.complete || img.naturalWidth === 0) return;
  const ratio = Math.min(width / img.naturalWidth, height / img.naturalHeight);
  const drawWidth = img.naturalWidth * ratio;
  const drawHeight = img.naturalHeight * ratio;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.fillStyle = PAPER;
  ctx.fillRect(x, y, drawWidth, drawHeight);
  ctx.drawImage(img, x, y, drawWidth, drawHeight);
}

function drawCurl(ctx, img, width, height, progress, direction) {
  if (progress <= 0) return;
  const foldedWidth = width * progress;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  // Back of the page (mirrored previous content).
  ctx.save();
  ctx.translate(direction > 0 ? foldedWidth : width - foldedWidth, 0);
  ctx.scale(direction > 0 ? -1 : -1, 1);
  const back = img;
  if (back && back.complete && back.naturalWidth > 0) {
    const ratio = Math.min(width / back.naturalWidth, height / back.naturalHeight);
    const drawWidth = back.naturalWidth * ratio;
    const drawHeight = back.naturalHeight * ratio;
    const dx = (width - drawWidth) / 2;
    const dy = (height - drawHeight) / 2;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(back, -dx, dy, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();

  // Curl shadow gradient on the leading edge.
  const gradient = ctx.createLinearGradient(
    direction > 0 ? foldedWidth - 24 : foldedWidth,
    0,
    direction > 0 ? foldedWidth : foldedWidth + 24,
    0,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.5, SHADOW);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(
    direction > 0 ? foldedWidth - 24 : foldedWidth,
    0,
    24,
    height,
  );
  ctx.restore();
}

/**
 * Canvas 2D renderer that paints the current page and a 3D-ish curl
 * during drag. Pointer events on the wrapper drive the flip state
 * machine; the canvas only reads from it.
 *
 * @param {object} props
 * @param {object|null} props.flipbook
 * @param {number} props.pageIndex
 * @param {(direction: 1 | -1) => void} props.onFlip Commit handler.
 * @returns {JSX.Element}
 */
export default function FlipbookCanvas({ flipbook, pageIndex, onFlip }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const totalPages = flipbook?.pages?.length ?? 0;
  const { progress, direction, bind } = usePageFlip({
    pageIndex,
    totalPages,
    onCommit: onFlip,
  });
  const { cache, isPageReady } = useImageLoader(flipbook?.pages || [], pageIndex, 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || !flipbook) return undefined;

    const draw = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const current = cache.get(pageIndex);
      const next = direction > 0 ? cache.get(pageIndex + 1) : cache.get(pageIndex - 1);
      if (direction > 0) {
        drawBase(ctx, next, width, height);
        drawBase(ctx, current, width, height);
      } else {
        drawBase(ctx, current, width, height);
        drawBase(ctx, next, width, height);
      }
      drawCurl(ctx, current, width, height, progress, direction);
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(wrapper);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [flipbook, pageIndex, progress, direction, cache]);

  if (!flipbook || totalPages === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5 text-muted">
        <div className="spinner-border text-primary me-2" aria-hidden="true" />
        <span>Loading flipbook…</span>
      </div>
    );
  }

  const ready = isPageReady(pageIndex);

  return (
    <div
      ref={wrapperRef}
      className="fb-canvas-wrapper position-relative w-100"
      style={{
        height: 'min(70vh, 720px)',
        background: FILL_BG,
        touchAction: 'pan-y',
        overscrollBehavior: 'contain',
        userSelect: 'none',
      }}
      role="region"
      aria-label="Flipbook pages"
      tabIndex={0}
      {...bind}
    >
      <canvas ref={canvasRef} className="d-block w-100 h-100" />
      {!ready && (
        <div className="position-absolute top-50 start-50 translate-middle text-light small">
          <div className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Preparing page…
        </div>
      )}
    </div>
  );
}
