import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import VirtualBookshelf from './page';
import { bookshelfService, bookService } from '../lib/api';

vi.mock('../lib/api', () => ({
  bookshelfService: {
    getAll: vi.fn(),
    getBooks: vi.fn(),
    addBook: vi.fn(),
    removeBook: vi.fn(),
    updateBookStatus: vi.fn(),
    updateBookNotes: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  bookService: {
    getMyBooks: vi.fn(),
  },
}));

// Mock sweetalert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock LofiContext
vi.mock('../contexts/LofiContext', () => ({
  useLofi: () => ({
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    volume: 0.5,
    currentTrack: { title: "Autumn Rainfall", artist: "Lofi Girl & Study Beats", coverUrl: "" },
    ambientStates: {
      rain: { active: false, volume: 0.5 },
      cafe: { active: false, volume: 0.5 },
      fire: { active: false, volume: 0.5 },
      nature: { active: false, volume: 0.5 },
    },
    ambientSounds: [
      { id: 'rain', name: 'Rain', icon: 'fa-cloud-showers-heavy' },
      { id: 'cafe', name: 'Cafe', icon: 'fa-mug-hot' },
      { id: 'fire', name: 'Fire', icon: 'fa-fire' },
      { id: 'nature', name: 'Nature', icon: 'fa-leaf' }
    ],
    nextTrack: vi.fn(),
    prevTrack: vi.fn(),
    togglePlay: vi.fn(),
    setVolume: vi.fn(),
    seek: vi.fn(),
    toggleAmbient: vi.fn(),
    setAmbientVolume: vi.fn()
  }),
}));

describe('VirtualBookshelf Detail & Status tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ id: 1, fullName: 'Test User' }));
    bookshelfService.getAll.mockResolvedValue({ data: [{ id: 10, name: 'Main Shelf', theme: 'glass' }] });
    bookService.getMyBooks.mockResolvedValue({ data: { content: [] } });
  });

  test('filters books on shelves by status tabs', async () => {
    const mockBooks = [
      { id: '101', bookId: 101, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', readingStatus: 'WANT_TO_READ', coverUrl: '' },
      { id: '102', bookId: 102, title: '1984', author: 'George Orwell', readingStatus: 'IN_PROGRESS', coverUrl: '' }
    ];
    bookshelfService.getBooks.mockResolvedValue({ data: mockBooks });

    render(<VirtualBookshelf />);

    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
    });

    // Click "Want Next" Tab
    const wantNextTab = screen.getByText(/^Want Next$/i);
    fireEvent.click(wantNextTab);

    // Only Gatsby should remain visible
    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });
  });

  test('opens details modal and updates status and notes', async () => {
    const mockBooks = [
      { id: '101', bookId: 101, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', readingStatus: 'WANT_TO_READ', notes: 'Old notes', coverUrl: '' }
    ];
    bookshelfService.getBooks.mockResolvedValue({ data: mockBooks });
    bookshelfService.updateBookStatus.mockResolvedValue({ data: {} });
    bookshelfService.updateBookNotes.mockResolvedValue({ data: {} });

    render(<VirtualBookshelf />);

    // Wait for books to load
    await waitFor(() => {
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });

    // Click on "View Details" button to open the modal
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);

    // Verify modal is open and has correct info
    expect(screen.getByRole('heading', { name: 'Book Details' })).toBeInTheDocument();
    
    // Check elements in modal
    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect.value).toBe('WANT_TO_READ');
    
    const notesTextarea = screen.getByPlaceholderText('Add your thoughts or notes...');
    expect(notesTextarea.value).toBe('Old notes');

    // Edit status and notes
    fireEvent.change(statusSelect, { target: { value: 'IN_PROGRESS' } });
    fireEvent.change(notesTextarea, { target: { value: 'New notes' } });

    // Save changes
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Verify API calls
    await waitFor(() => {
      expect(bookshelfService.updateBookStatus).toHaveBeenCalledWith(10, 101, 'IN_PROGRESS');
      expect(bookshelfService.updateBookNotes).toHaveBeenCalledWith(10, 101, 'New notes');
    });
  });
});
