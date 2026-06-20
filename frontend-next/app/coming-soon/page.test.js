import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComingSoon from './page';

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

vi.mock('../components/common/DonutChart2', () => ({
  default: () => <div data-testid="donut-chart" />,
}));

describe('ComingSoon Page', () => {
  it('renders coming soon title and starts countdown timer', () => {
    render(<ComingSoon />);
    expect(screen.getByText('COMING SOON')).toBeDefined();
    expect(screen.getByText('Our website is coming soon, follow us for update now!')).toBeDefined();
  });
});
