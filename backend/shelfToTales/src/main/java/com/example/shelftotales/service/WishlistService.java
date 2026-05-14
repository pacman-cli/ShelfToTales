package com.example.shelftotales.service;

import com.example.shelftotales.model.Book;
import com.example.shelftotales.model.User;
import com.example.shelftotales.model.WishlistItem;
import com.example.shelftotales.repository.BookRepository;
import com.example.shelftotales.repository.UserRepository;
import com.example.shelftotales.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new IllegalArgumentException("Authentication required");
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public List<Book> getUserWishlist() {
        User user = getAuthenticatedUser();
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(WishlistItem::getBook)
                .collect(Collectors.toList());
    }

    public void addToWishlist(Long bookId) {
        User user = getAuthenticatedUser();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        if (wishlistRepository.findByUserIdAndBookId(user.getId(), bookId).isEmpty()) {
            WishlistItem item = WishlistItem.builder()
                    .user(user)
                    .book(book)
                    .build();
            wishlistRepository.save(item);
        }
    }

    @Transactional
    public void removeFromWishlist(Long bookId) {
        User user = getAuthenticatedUser();
        wishlistRepository.deleteByUserIdAndBookId(user.getId(), bookId);
    }
}