import React from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function Boom() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  let errSpy;
  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>healthy child</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('healthy child')).toBeInTheDocument();
  });

  test('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  test('surfaces the thrown error message in the fallback', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
