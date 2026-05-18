'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Next.js port of the CRA <ProtectedRoute>. Wraps a page's content; if no
 * JWT is in localStorage, redirects to /shop-login. Until we either find a
 * token or finish redirecting, render nothing (avoid flash of protected UI).
 */
export function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token =
      typeof window !== 'undefined' && window.localStorage.getItem('token');
    if (!token && pathname !== '/shop-login') {
      router.replace('/shop-login');
    }
  }, [router, pathname]);

  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem('token');
  if (!token) return null;

  return children;
}
