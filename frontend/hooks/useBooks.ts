"use client";

import { useState, useCallback } from "react";
import { Book } from "@/lib/types";
import { searchBooks, getFeaturedBooks } from "@/lib/api";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const search = useCallback(async (query: string, startIndex = 0) => {
    if (!query.trim()) {
      setBooks([]);
      setTotalItems(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await searchBooks(query, startIndex);
      setBooks(result.books);
      setTotalItems(result.totalItems);
    } catch {
      setError("Failed to search books. Please try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFeatured = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const featured = await getFeaturedBooks();
      setBooks(featured);
      setTotalItems(featured.length);
    } catch {
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, totalItems, search, loadFeatured };
}
