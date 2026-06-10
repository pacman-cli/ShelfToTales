import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyDonations from './page';

vi.mock('../../lib/api', () => ({
  donationService: {
    getMyListings: vi.fn().mockResolvedValue({ data: [] }),
    getMyRequests: vi.fn().mockResolvedValue({ data: [] }),
  },
  exchangeService: {
    getMyListings: vi.fn().mockResolvedValue({ data: { content: [] } }),
    getIncoming: vi.fn().mockResolvedValue({ data: { content: [] } }),
    getOutgoing: vi.fn().mockResolvedValue({ data: { content: [] } }),
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

vi.mock('../../components/ClientOnly', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

describe('MyDonations Console', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders donation tabs and supports switching', async () => {
    render(<MyDonations />);
    
    const listingsTab = screen.getByText('My Listings');
    const requestsTab = screen.getByText('My Requests');
    expect(listingsTab).toBeDefined();
    expect(requestsTab).toBeDefined();
    
    // Click requests tab
    fireEvent.click(requestsTab);
    
    // Should switch to requests view
    await waitFor(() => {
      expect(requestsTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});
