import Link from "next/link";
import { BookOpen, Search, Heart, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen size={40} className="text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Your Next Great Read
          <br />
          <span className="text-primary">Starts Here</span>
        </h1>
        <p className="mb-8 max-w-lg text-lg text-muted">
          Discover millions of books, build your reading wishlist, and find your next favorite story.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Browse Books
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 font-medium text-foreground hover:bg-card-hover transition-colors"
          >
            Create Account
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-3">
        {[
          {
            icon: Search,
            title: "Search & Discover",
            desc: "Explore millions of books from the Google Books catalog",
          },
          {
            icon: BookOpen,
            title: "Book Details",
            desc: "View covers, descriptions, ratings, and publishing info",
          },
          {
            icon: Heart,
            title: "Save Wishlist",
            desc: "Build your personal reading list for later",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon size={24} className="text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
