"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, BookOpen, Globe, Star, Hash } from "lucide-react";
import { Book } from "@/lib/types";
import { getBookById } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import WishlistButton from "@/components/books/WishlistButton";

export default function BookDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBookById(id);
        setBook(data);
      } catch {
        setError("Book not found");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-32" />;

  if (error || !book) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg text-danger mb-4">{error || "Book not found"}</p>
        <Link href="/books" className="text-primary hover:text-primary-dark">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/books"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to catalog
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <div className="relative mx-auto w-48 md:w-56">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border shadow-lg">
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover"
                sizes="224px"
                priority
                unoptimized
              />
            </div>
            <div className="mt-4 flex justify-center">
              <WishlistButton bookId={book.id} size={24} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {book.title}
          </h1>
          <p className="mt-1 text-lg text-muted">{book.authors.join(", ")}</p>

          {book.averageRating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.round(book.averageRating!) ? "currentColor" : "none"}
                    className={i < Math.round(book.averageRating!) ? "" : "text-border"}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {book.averageRating} ({book.ratingsCount?.toLocaleString() ?? 0} ratings)
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {book.categories.map((cat) => (
              <Badge key={cat} variant="primary">{cat}</Badge>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {book.publishedDate !== "Unknown" && (
              <InfoItem icon={Calendar} label="Published" value={book.publishedDate} />
            )}
            {book.pageCount > 0 && (
              <InfoItem icon={BookOpen} label="Pages" value={String(book.pageCount)} />
            )}
            {book.language && (
              <InfoItem icon={Globe} label="Language" value={book.language.toUpperCase()} />
            )}
            {book.isbn && (
              <InfoItem icon={Hash} label="ISBN" value={book.isbn} />
            )}
          </div>

          {book.publisher && (
            <p className="mt-4 text-sm text-muted">
              Published by <span className="text-foreground">{book.publisher}</span>
            </p>
          )}

          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Description</h2>
            <div
              className="prose prose-sm max-w-none text-muted leading-relaxed"
              dangerouslySetInnerHTML={{ __html: book.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card-hover p-2.5">
      <div className="flex items-center gap-1 text-muted mb-0.5">
        <Icon size={12} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xs font-medium text-foreground truncate">{value}</p>
    </div>
  );
}
