'use client';

import React, { useState } from 'react';

/**
 * Sentence-level spoiler reveal. Each tagged sentence is independently
 * blurred until the user opts in. The "Reveal all" toggle controls the
 * whole block. Pure presentational — receives sentences from the parent.
 */
export default function SpoilerReveal({ sentences, level, sanitized }) {
  const [revealed, setRevealed] = useState(false);
  if (!sentences || sentences.length === 0) {
    return <span>{sanitized || ''}</span>;
  }

  const isSafe = level === 'SAFE';
  if (isSafe) {
    return <span>{sentences.map(s => s.text).join(' ')}</span>;
  }

  return (
    <div>
      <div
        aria-live="polite"
        style={{
          filter: revealed ? 'none' : 'blur(6px)',
          userSelect: revealed ? 'text' : 'none',
          transition: 'filter 0.2s ease',
          minHeight: 40,
        }}
      >
        {sentences.map((s, i) => (
          <span
            key={i}
            style={{
              display: 'inline',
              background: s.level === 'MAJOR_SPOILER' ? 'rgba(255, 90, 95, 0.15)' :
                          s.level === 'MINOR_SPOILER' ? 'rgba(255, 195, 0, 0.12)' : 'transparent',
              padding: s.level !== 'SAFE' ? '0 4px' : 0,
              borderRadius: 4,
            }}
          >
            {s.text}{i < sentences.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 12,
            fontSize: '0.75rem',
            background: level === 'MAJOR_SPOILER' ? '#ff5a5f' :
                        level === 'MINOR_SPOILER' ? '#ffc300' : '#2e8b57',
            color: '#fff',
          }}
        >
          {level === 'MAJOR_SPOILER' ? 'Major Spoiler' :
           level === 'MINOR_SPOILER' ? 'Minor Spoiler' : 'Safe'}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={() => setRevealed(r => !r)}
        >
          {revealed ? 'Hide spoilers' : 'Reveal spoilers'}
        </button>
      </div>
    </div>
  );
}
