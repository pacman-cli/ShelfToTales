import {
  GoogleBooksResponse,
  Book,
  mapGoogleBookToBook,
} from "./types";

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

export async function searchBooks(
  query: string,
  startIndex = 0,
  maxResults = 12
): Promise<{ books: Book[]; totalItems: number }> {
  if (!query.trim()) return { books: [], totalItems: 0 };

  const params = new URLSearchParams({
    q: query,
    startIndex: String(startIndex),
    maxResults: String(maxResults),
  });

  const res = await fetch(`${GOOGLE_BOOKS_API}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch books");

  const data: GoogleBooksResponse = await res.json();
  return {
    books: (data.items ?? []).map(mapGoogleBookToBook),
    totalItems: data.totalItems,
  };
}

export async function getBookById(id: string): Promise<Book> {
  const res = await fetch(`${GOOGLE_BOOKS_API}/${id}`);
  if (!res.ok) throw new Error("Book not found");

  const item = await res.json();
  return mapGoogleBookToBook(item);
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const { books } = await searchBooks("subject:fiction", 0, 12);
  return books;
}
