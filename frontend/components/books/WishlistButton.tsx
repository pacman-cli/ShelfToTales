"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  bookId: string;
  size?: number;
}

export default function WishlistButton({ bookId, size = 20 }: WishlistButtonProps) {
  const { isInWishlist, toggle } = useWishlist();
  const inList = isInWishlist(bookId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(bookId);
      }}
      className={`rounded-full p-1.5 backdrop-blur-sm transition-colors ${
        inList
          ? "bg-accent/20 text-accent"
          : "bg-black/30 text-white hover:bg-accent/20 hover:text-accent"
      }`}
      aria-label={inList ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={size} fill={inList ? "currentColor" : "none"} />
    </button>
  );
}
