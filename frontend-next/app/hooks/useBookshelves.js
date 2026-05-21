'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookshelfService } from '../lib/api';

/**
 * Encapsulates bookshelf CRUD. Fetches all shelves on mount and exposes
 * helpers to create / delete shelves and add books to a shelf.
 */
export function useBookshelves() {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await bookshelfService.getAll();
      setShelves(res.data);
    } catch {
      // Silently ignore — shelves stay empty on error.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addShelf = async (data) => {
    await bookshelfService.create(data);
    await refresh();
  };

  const removeShelf = async (id) => {
    await bookshelfService.delete(id);
    await refresh();
  };

  const addBookToShelf = async (shelfId, bookId) => {
    await bookshelfService.addBook(shelfId, bookId);
  };

  return { shelves, loading, addShelf, removeShelf, addBookToShelf, refresh };
}
