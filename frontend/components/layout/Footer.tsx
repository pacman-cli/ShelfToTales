import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-muted">
            <BookOpen size={20} />
            <span className="text-sm font-medium">Shelf To Tales</span>
          </div>
          <p className="text-xs text-muted">
            Book data powered by Google Books API
          </p>
        </div>
      </div>
    </footer>
  );
}
