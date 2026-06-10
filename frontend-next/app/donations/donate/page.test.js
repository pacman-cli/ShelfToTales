import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DonateBook from './page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../lib/api', () => ({
  bookService: {
    search: vi.fn().mockResolvedValue({
      data: {
        content: [
          { id: 45, title: 'Test Book Title', author: 'Test Author', coverUrl: '' }
        ]
      }
    }),
  },
  donationService: {
    create: vi.fn().mockResolvedValue({}),
  },
  exchangeService: {
    createListing: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../components/ClientOnly', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe('DonateBook Page Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form title and toggles fields depending on purpose type selection', async () => {
    render(<DonateBook />);
    expect(screen.getByText('Donate a Book')).toBeDefined();

    // Check Donation select is default and shows manual checkbox
    expect(screen.getByText('Book is not in the store catalog (Enter details manually)')).toBeDefined();

    // Click "Swap" purpose button
    const swapBtn = screen.getByText('Swap (Peer Exchange)');
    fireEvent.click(swapBtn);

    // Verify manual entry checkbox is hidden and location is shown
    expect(screen.queryByText('Book is not in the store catalog (Enter details manually)')).toBeNull();
    expect(screen.getByLabelText(/location/i)).toBeDefined();
  });
});
