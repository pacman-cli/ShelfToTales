export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  publishedDate: string;
  pageCount: number;
  categories: string[];
  averageRating?: number;
  ratingsCount?: number;
  isbn?: string;
  publisher?: string;
  language?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GoogleBooksResponse {
  totalItems: number;
  items: GoogleBookItem[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    publisher?: string;
    language?: string;
  };
}

export function mapGoogleBookToBook(item: GoogleBookItem): Book {
  const info = item.volumeInfo;
  return {
    id: item.id,
    title: info.title,
    authors: info.authors ?? ["Unknown Author"],
    description: info.description ?? "No description available.",
    thumbnail:
      info.imageLinks?.thumbnail?.replace("http://", "https://") ??
      "/images/no-cover.svg",
    publishedDate: info.publishedDate ?? "Unknown",
    pageCount: info.pageCount ?? 0,
    categories: info.categories ?? [],
    averageRating: info.averageRating,
    ratingsCount: info.ratingsCount,
    isbn: info.industryIdentifiers?.find((i) => i.type === "ISBN_13")
      ?.identifier,
    publisher: info.publisher,
    language: info.language,
  };
}
