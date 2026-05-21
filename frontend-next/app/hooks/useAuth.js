'use client';

import { useAuthContext } from '../contexts/AuthContext';

/**
 * Thin wrapper around AuthContext. Keeps component imports clean and
 * decouples them from the context implementation.
 */
export function useAuth() {
  const { user, isAuthenticated, loading, login, googleAuth, logout, updateProfile } =
    useAuthContext();

  return { user, isAuthenticated, loading, login, googleAuth, logout, updateProfile };
}
