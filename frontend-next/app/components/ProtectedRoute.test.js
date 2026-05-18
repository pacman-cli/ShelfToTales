import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Use vi.hoisted so the shared mockReplace is defined before vi.mock runs.
const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/private',
}));

import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Defensive: jsdom should set this up but make it explicit.
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.clear();
    }
    mockReplace.mockClear();
  });

  test('redirects to /shop-login when no token is present', async () => {
    render(
      <ProtectedRoute>
        <div>secret content</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/shop-login');
    });
  });

  test('renders children when a token is present', () => {
    globalThis.localStorage.setItem('token', 'fake-jwt');
    render(
      <ProtectedRoute>
        <div>secret content</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('secret content')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
