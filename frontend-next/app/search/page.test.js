import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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
    trackClick: vi.fn(),
  },
}));

import Page from './page';

describe('SearchResults page (fake timers)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockUseSearch.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders results from unified response', async () => {
    mockUseSearch.mockReturnValue({
      data: { results: [{ id: 1, bookId: 1, title: 'Cosmos', author: 'Carl Sagan', coverUrl: '/c.jpg', categoryName: 'Science', price: 14.99, matchedSources: ['text', 'semantic'] }], total: 1, signals: { text: 'ok', semantic: 'ok' } },
      loading: false, error: null, signals: { text: 'ok', semantic: 'ok' }, run: vi.fn(),
    });

    render(<Page />);
    expect(await screen.findByText('Cosmos')).toBeInTheDocument();
    expect(screen.getByText('Carl Sagan')).toBeInTheDocument();
    expect(screen.getByText('Text + semantic match')).toBeInTheDocument();
  });

  it('shows degraded banner when semantic is degraded', async () => {
    mockUseSearch.mockReturnValue({
      data: { results: [], total: 0, signals: { text: 'ok', semantic: 'degraded' } },
      loading: false, error: null, signals: { text: 'ok', semantic: 'degraded' }, run: vi.fn(),
    });

    render(<Page />);
    expect(await screen.findByText(/Semantic search is temporarily unavailable/i)).toBeInTheDocument();
  });

  it('shows empty state when results.length is 0', async () => {
    mockUseSearch.mockReturnValue({
      data: { results: [], total: 0, signals: { text: 'ok', semantic: 'ok' } },
      loading: false, error: null, signals: { text: 'ok', semantic: 'ok' }, run: vi.fn(),
    });

    render(<Page />);
    expect(await screen.findByText('No books found')).toBeInTheDocument();
  });

  it('shows Personalized badge when response says so', async () => {
    mockUseSearch.mockReturnValue({
      data: { results: [], total: 0, signals: { text: 'ok', semantic: 'ok' }, personalized: true },
      loading: false, error: null, signals: { text: 'ok', semantic: 'ok' }, run: vi.fn(),
    });

    render(<Page />);
    expect(await screen.findByText(/Personalized for you/i)).toBeInTheDocument();
  });
});
