"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Book } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import WishlistButton from "./WishlistButton";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary-light hover:-translate-y-1">
      <Link href={`/books/${book.id}`} className="block">
        <div className="relative aspect-[2/3] w-full bg-border/30">
          <Image
            src={book.thumbnail}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="mt-1 text-xs text-muted line-clamp-1">
            {book.authors.join(", ")}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {book.averageRating && (
              <div className="flex items-center gap-0.5 text-secondary">
                <Star size={12} fill="currentColor" />
                <span className="text-xs font-medium">{book.averageRating}</span>
              </div>
            )}
            {book.categories.length > 0 && (
              <Badge variant="primary" className="text-[10px]">
                {book.categories[0]}
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        <WishlistButton bookId={book.id} />
      </div>
    </div>
  );
}
