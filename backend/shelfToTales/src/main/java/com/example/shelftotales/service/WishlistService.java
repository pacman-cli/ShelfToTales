package com.example.shelftotales.service;

import com.example.shelftotales.dto.WishlistItemResponse;
import com.example.shelftotales.model.Book;
import com.example.shelftotales.model.User;
import com.example.shelftotales.model.WishlistItem;
import com.example.shelftotales.repository.BookRepository;
import com.example.shelftotales.repository.UserRepository;
import com.example.shelftotales.repository.WishlistRepository;
import com.example.shelftotales.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getUserWishlist() {
        User user = AuthUtils.getCurrentUser(userRepository);
        return wishlistRepository.findByUserIdWithBook(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(Long bookId) {
        User user = AuthUtils.getCurrentUser(userRepository);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        try {
            wishlistRepository.save(WishlistItem.builder().user(user).book(book).build());
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Book already in wishlist");
        }
    }

    @Transactional
    public void removeFromWishlist(Long bookId) {
        User user = AuthUtils.getCurrentUser(userRepository);
        wishlistRepository.deleteByUserIdAndBookId(user.getId(), bookId);
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .bookId(item.getBook().getId())
                .title(item.getBook().getTitle())
                .author(item.getBook().getAuthor())
                .coverUrl(item.getBook().getCoverUrl())
                .description(item.getBook().getDescription())
                .addedAt(item.getAddedAt())
                .build();
    }
}
