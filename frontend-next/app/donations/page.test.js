import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DiscoverDonations from './page';

vi.mock('../lib/api', () => ({
  donationService: {
    getAvailable: vi.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          bookTitle: 'Free Book Title',
          bookAuthor: 'Free Book Author',
          donorName: 'Alice',
          condition: 'Good',
          status: 'AVAILABLE',
        },
      ],
    }),
    request: vi.fn(),
  },
  exchangeService: {
    getListings: vi.fn().mockResolvedValue({
      data: {
        content: [
          {
            id: 10,
            book: { title: 'Swap Book Title', author: 'Swap Book Author', coverUrl: '' },
            user: { fullName: 'Bob' },
            bookCondition: 'GOOD',
            type: 'SWAP',
            location: 'Dhaka',
            status: 'AVAILABLE',
          },
        ],
      },
    }),
    sendRequest: vi.fn(),
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

vi.mock('../components/ClientOnly', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe('DiscoverDonations (Giving Economy Hub)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders donations tab by default', async () => {
    render(<DiscoverDonations />);

    await waitFor(() => {
      expect(screen.getByText('The Giving Economy')).toBeDefined();
    });
  });

  it('shows Peer Swaps tab button', async () => {
    render(<DiscoverDonations />);

    await waitFor(() => {
      const swapsTab = screen.getByRole('tab', { name: /peer swaps/i });
      expect(swapsTab).toBeDefined();
    });
  });
});
