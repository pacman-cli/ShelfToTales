"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "shelf-to-tales-wishlist";

interface WishlistContextType {
  wishlistIds: string[];
  isInWishlist: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

export const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  isInWishlist: () => false,
  toggle: () => {},
  clear: () => {},
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setWishlistIds(JSON.parse(stored));
      } catch {
        /* ignore corrupt data */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const isInWishlist = useCallback(
    (id: string) => wishlistIds.includes(id),
    [wishlistIds]
  );

  const toggle = useCallback((id: string) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const clear = useCallback(() => setWishlistIds([]), []);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggle, clear }}>
      {children}
    </WishlistContext.Provider>
  );
}
