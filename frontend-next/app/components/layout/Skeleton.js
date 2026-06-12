'use client';

import React from 'react';

/**
 * Lightweight skeleton block. Renders a shimmer placeholder sized to a
 * sensible line count. Used during initial load of dashboard/chat/search.
 */
export default function Skeleton({ lines = 3, height = 16, width = '100%', gap = 10 }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      style={{ display: 'flex', flexDirection: 'column', gap, width }}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: i === lines - 1 ? '70%' : '100%',
            background: 'linear-gradient(90deg, #eee 0%, #f5f5f5 50%, #eee 100%)',
            backgroundSize: '200% 100%',
            borderRadius: 6,
            animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`@keyframes skeleton-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
