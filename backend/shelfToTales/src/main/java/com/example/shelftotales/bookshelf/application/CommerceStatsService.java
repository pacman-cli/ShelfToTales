package com.example.shelftotales.bookshelf.application;

import com.example.shelftotales.commerce.domain.CartItem;
import com.example.shelftotales.commerce.infrastructure.CartItemRepository;
import com.example.shelftotales.commerce.infrastructure.OrderRepository;
import com.example.shelftotales.wishlist.domain.WishlistItem;
import com.example.shelftotales.wishlist.infrastructure.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommerceStatsService {

    private final CartItemRepository cartItemRepository;
    private final WishlistRepository wishlistRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<CartItem> getCartItems(Long userId) {
        return safeGet(
            () -> cartItemRepository.findByUserIdWithBook(userId),
            List.of()
        );
    }

    @Transactional(readOnly = true)
    public List<WishlistItem> getWishlistItems(Long userId) {
        return safeGet(
            () -> wishlistRepository.findByUserIdWithBook(userId),
            List.of()
        );
    }

    @Transactional(readOnly = true)
    public int getOrderCount(Long userId) {
        return safeGet(
            () -> (int) orderRepository.countByUserId(userId), 0
        );
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalSpent(Long userId) {
        return safeGet(
            () -> orderRepository.sumTotalAmountByUserId(userId), BigDecimal.ZERO
        );
    }

    public BigDecimal getCartTotalValue(List<CartItem> cartItems) {
        BigDecimal cartTotalValue = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            if (item.getBook().getPrice() != null) {
                cartTotalValue = cartTotalValue.add(
                    item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                );
            }
        }
        return cartTotalValue;
    }

    private <T> T safeGet(Supplier<T> supplier, T fallback) {
        try {
            return supplier.get();
        } catch (Exception e) {
            log.warn("Commerce stats aggregation failed", e);
            return fallback;
        }
    }
}
