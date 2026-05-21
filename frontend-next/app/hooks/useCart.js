'use client';

import { useCartContext } from '../contexts/CartContext';

/**
 * Thin wrapper around CartContext. Keeps component imports clean and
 * decouples them from the context implementation.
 */
export function useCart() {
  const { items, count, total, loading, refreshCart, addToCart, updateQuantity, removeFromCart } =
    useCartContext();

  return { items, count, total, loading, refreshCart, addToCart, updateQuantity, removeFromCart };
}
