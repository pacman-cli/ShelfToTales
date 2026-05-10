"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search books by title, author, or ISBN...",
  defaultValue = "",
  debounceMs = 400,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [value, debounceMs, onSearch]);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
