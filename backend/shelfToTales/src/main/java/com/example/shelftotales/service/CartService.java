package com.example.shelftotales.service;

import com.example.shelftotales.dto.*;
import com.example.shelftotales.model.Book;
import com.example.shelftotales.model.CartItem;
import com.example.shelftotales.model.User;
import com.example.shelftotales.repository.BookRepository;
import com.example.shelftotales.repository.CartItemRepository;
import com.example.shelftotales.repository.UserRepository;
import com.example.shelftotales.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart() {
        User user = AuthUtils.getCurrentUser(userRepository);
        return buildCartResponse(cartItemRepository.findByUserIdWithBook(user.getId()));
    }

    @Transactional
    public CartResponse addToCart(Long bookId, int quantity) {
        User user = AuthUtils.getCurrentUser(userRepository);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        cartItemRepository.findByUserIdAndBookId(user.getId(), bookId)
                .ifPresentOrElse(
                        item -> { item.setQuantity(item.getQuantity() + quantity); cartItemRepository.save(item); },
                        () -> cartItemRepository.save(CartItem.builder().user(user).book(book).quantity(quantity).build()));

        return buildCartResponse(cartItemRepository.findByUserIdWithBook(user.getId()));
    }

    @Transactional
    public CartResponse updateQuantity(Long bookId, int quantity) {
        User user = AuthUtils.getCurrentUser(userRepository);
        CartItem item = cartItemRepository.findByUserIdAndBookId(user.getId(), bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not in cart: " + bookId));
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return buildCartResponse(cartItemRepository.findByUserIdWithBook(user.getId()));
    }

    @Transactional
    public CartResponse removeFromCart(Long bookId) {
        User user = AuthUtils.getCurrentUser(userRepository);
        cartItemRepository.deleteByUserIdAndBookId(user.getId(), bookId);
        return buildCartResponse(cartItemRepository.findByUserIdWithBook(user.getId()));
    }

    private CartResponse buildCartResponse(List<CartItem> items) {
        List<CartItemResponse> itemResponses = items.stream().map(item -> {
            BigDecimal price = item.getBook().getPrice() != null ? item.getBook().getPrice() : BigDecimal.ZERO;
            return CartItemResponse.builder()
                    .id(item.getId()).bookId(item.getBook().getId())
                    .title(item.getBook().getTitle()).author(item.getBook().getAuthor())
                    .coverUrl(item.getBook().getCoverUrl()).quantity(item.getQuantity())
                    .unitPrice(price).subtotal(price.multiply(BigDecimal.valueOf(item.getQuantity())))
                    .build();
        }).collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder().items(itemResponses)
                .totalItems(itemResponses.size()).totalPrice(total).build();
    }
}
