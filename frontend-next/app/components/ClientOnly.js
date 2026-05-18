'use client';

import { useEffect, useState } from 'react';

/**
 * Renders `children` only after the component has mounted on the client.
 *
 * The legacy CRA pages we ported read `localStorage` and `window` directly
 * at render time. Next.js still tries to render the server-side shell of
 * client components during `next build`, which crashes.
 *
 * Wrapping the page tree in this boundary keeps the app behaving exactly
 * like the original CSR-only CRA build: no server render at all. We pay
 * a small first-paint penalty in exchange for not having to manually
 * audit every page for SSR-safety.
 *
 * When individual pages are refactored to be SSR-safe, they can be
 * lifted out of this wrapper one at a time.
 */
export default function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return children;
}
