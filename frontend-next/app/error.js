'use client';

import { useEffect } from 'react';

/**
 * Root error boundary. Next.js renders this when an uncaught error
 * propagates out of a route segment. We log to the console (in dev)
 * and offer a reset action.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Route-level error:', error);
  }, [error]);

  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        maxWidth: 720,
        margin: '60px auto',
      }}
    >
      <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {error?.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="btn btn-primary btnhover"
      >
        Try again
      </button>
    </div>
  );
}
