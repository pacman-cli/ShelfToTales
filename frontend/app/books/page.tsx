"use client";

import { useEffect, useCallback } from "react";
import SearchBar from "@/components/layout/SearchBar";
import BookGrid from "@/components/books/BookGrid";
import Spinner from "@/components/ui/Spinner";
import { useBooks } from "@/hooks/useBooks";

export default function BooksPage() {
  const { books, loading, error, totalItems, search, loadFeatured } = useBooks();

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const handleSearch = useCallback(
    (query: string) => {
      if (query) {
        search(query);
      } else {
        loadFeatured();
      }
    },
    [search, loadFeatured]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Browse Books</h1>
        <SearchBar onSearch={handleSearch} />
        {totalItems > 0 && !loading && (
          <p className="text-sm text-muted">
            {totalItems.toLocaleString()} results found
          </p>
        )}
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-danger">{error}</p>
        </div>
      ) : (
        <BookGrid books={books} emptyMessage="Search for books to get started" />
      )}
    </div>
  );
}
