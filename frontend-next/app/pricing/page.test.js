import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pricing from './page';

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

vi.mock('../components/layout/PageTitle', () => ({
  default: ({ childPage }) => <div data-testid="page-title">{childPage}</div>,
}));

vi.mock('../components/features/NewsLetter', () => ({
  default: () => <div data-testid="newsletter" />,
}));

vi.mock('../components/common/AnimationUtils', () => ({
  FadeIn: ({ children }) => <div>{children}</div>,
}));

describe('Pricing Page', () => {
  it('renders three custom ShelfToTales membership plans', () => {
    render(<Pricing />);
    expect(screen.getByText('Reader (Free)')).toBeDefined();
    expect(screen.getByText('Scholar')).toBeDefined();
    expect(screen.getByText('Librarian')).toBeDefined();
    expect(screen.getByText('AI Semantic Search Access')).toBeDefined();
    expect(screen.getByText('Unlimited AI Chat Support')).toBeDefined();
  });
});
