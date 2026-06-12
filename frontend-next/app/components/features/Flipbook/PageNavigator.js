'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Page counter with prev/next controls and a click-to-jump input. Stays
 * keyboard-friendly: the counter doubles as a number input that commits on
 * Enter or blur.
 *
 * @param {object} props
 * @param {number} props.pageIndex Zero-based current page.
 * @param {number} props.totalPages Total page count.
 * @param {(index: number) => void} props.onGoTo Jump handler.
 * @param {() => void} props.onPrev Previous page handler.
 * @param {() => void} props.onNext Next page handler.
 * @returns {JSX.Element}
 */
export default function PageNavigator({ pageIndex, totalPages, onGoTo, onPrev, onNext }) {
  const [draft, setDraft] = useState(String(pageIndex + 1));
  const inputRef = useRef(null);
  const isFirst = pageIndex <= 0;
  const isLast = pageIndex >= totalPages - 1;

  useEffect(() => {
    setDraft(String(pageIndex + 1));
  }, [pageIndex]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isFinite(parsed)) {
      onGoTo(Math.max(1, Math.min(totalPages, parsed)) - 1);
    } else {
      setDraft(String(pageIndex + 1));
    }
  };

  return (
    <div
      className="d-flex align-items-center gap-2"
      role="group"
      aria-label="Page navigation"
    >
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Previous page"
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>
      <label className="visually-hidden" htmlFor="fb-page-input">Current page</label>
      <input
        id="fb-page-input"
        ref={inputRef}
        type="text"
        inputMode="numeric"
        spellCheck={false}
        autoComplete="off"
        className="form-control form-control-sm text-center"
        style={{ width: '4.5rem' }}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
          }
        }}
        aria-label={`Page ${pageIndex + 1} of ${totalPages}`}
      />
      <span className="small text-muted" aria-hidden="true">/ {totalPages || '…'}</span>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={onNext}
        disabled={isLast}
        aria-label="Next page"
      >
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
    </div>
  );
}
