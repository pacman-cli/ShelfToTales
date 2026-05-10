"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, BookOpen } from "lucide-react";
import { Book } from "@/lib/types";
import { getBookById } from "@/lib/api";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import BookGrid from "@/components/books/BookGrid";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { wishlistIds, clear } = useWishlist();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      if (wishlistIds.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = await Promise.all(
          wishlistIds.map((id) => getBookById(id).catch(() => null))
        );
        setBooks(results.filter((b): b is Book => b !== null));
      } catch {
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [wishlistIds]);

  if (authLoading) return <Spinner size="lg" className="py-32" />;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Heart size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to view wishlist</h1>
        <p className="text-muted mb-6">Create an account to save books for later</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          <p className="mt-1 text-sm text-muted">
            {wishlistIds.length} {wishlistIds.length === 1 ? "book" : "books"} saved
          </p>
        </div>
        {wishlistIds.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear}>
            Clear All
          </Button>
        )}
      </div>

      {loading ? (
        <Spinner size="lg" className="py-20" />
      ) : books.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card-hover">
            <BookOpen size={32} className="text-muted" />
          </div>
          <p className="text-lg text-muted mb-4">Your wishlist is empty</p>
          <Link
            href="/books"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Browse books to add some
          </Link>
        </div>
      ) : (
        <BookGrid books={books} />
      )}
    </div>
  );
}
