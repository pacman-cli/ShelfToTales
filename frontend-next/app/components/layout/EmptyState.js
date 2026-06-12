'use client';

import React from 'react';

export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div
      style={{
        padding: '2rem 1rem',
        textAlign: 'center',
        color: '#6c757d',
        background: '#fafafa',
        borderRadius: 12,
        border: '1px dashed #e0e0e0',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden>📭</div>
      <h3 style={{ fontSize: '1rem', marginBottom: 4, color: '#333' }}>{title}</h3>
      {description && <p style={{ fontSize: '0.875rem', margin: 0 }}>{description}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
