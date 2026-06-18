import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('q=cosmos'),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/search',
}));

const mockUseSearch = vi.fn();
vi.mock('@/hooks/useSearch', () => ({
  useSearch: (opts) => mockUseSearch(opts),
}));

vi.mock('@/lib/api', () => ({
  __esModule: true,
  searchService: {
    unifiedSearch: vi.fn(),
    imageSearch: vi.fn(),
  },
}));

import Page from './page';

describe('SearchResults page', () => {
  beforeEach(() => {
    mockUseSearch.mockReset();
  });

  it('renders results from unified response', async () => {
    mockUseSearch.mockReturnValue({
      data: {
        results: [
          { id: 1, bookId: 1, title: 'Cosmos', author: 'Carl Sagan', coverUrl: '/c.jpg',
            categoryName: 'Science', price: 14.99, matchedSources: ['text', 'semantic'] },
        ],
        total: 1,
        signals: { text: 'ok', semantic: 'ok' },
      },
      loading: false,
      error: null,
      signals: { text: 'ok', semantic: 'ok' },
      run: vi.fn(),
    });

    render(<Page />);
    await waitFor(() => expect(screen.getByText('Cosmos')).toBeInTheDocument());
    expect(screen.getByText('Carl Sagan')).toBeInTheDocument();
    expect(screen.getByText('Text + semantic match')).toBeInTheDocument();
  });

  it('shows degraded banner when semantic is degraded', async () => {
    mockUseSearch.mockReturnValue({
      data: { results: [], total: 0, signals: { text: 'ok', semantic: 'degraded' } },
      loading: false,
      error: null,
      signals: { text: 'ok', semantic: 'degraded' },
      run: vi.fn(),
    });

    render(<Page />);
    expect(await screen.findByText(/Semantic search is temporarily unavailable/i)).toBeInTheDocument();
  });

  it('shows empty state when results.length is 0', async () => {
    mockUseSearch.mockReturnValue({
      data: { results: [], total: 0, signals: { text: 'ok', semantic: 'ok' } },
      loading: false,
      error: null,
      signals: { text: 'ok', semantic: 'ok' },
      run: vi.fn(),
    });

    render(<Page />);
    expect(await screen.findByText('No books found')).toBeInTheDocument();
  });
});