package com.example.shelftotales.service;

import com.example.shelftotales.dto.ShelfBookResponse;
import com.example.shelftotales.model.*;
import com.example.shelftotales.repository.*;
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
public class ShelfBookService {
    private final ShelfBookRepository shelfBookRepository;
    private final BookshelfRepository bookshelfRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new IllegalArgumentException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + auth.getName()));
    }

    private Bookshelf getOwnedShelf(Long shelfId) {
        User user = getAuthenticatedUser();
        return bookshelfRepository.findByIdAndUserId(shelfId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bookshelf not found: " + shelfId));
    }

    public List<ShelfBookResponse> getShelfBooks(Long shelfId) {
        getOwnedShelf(shelfId);
        return shelfBookRepository.findByBookshelfIdOrderByAddedAtAsc(shelfId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ShelfBookResponse addBookToShelf(Long shelfId, Long bookId) {
        Bookshelf shelf = getOwnedShelf(shelfId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        if (shelfBookRepository.existsByBookshelfIdAndBookId(shelfId, bookId)) {
            throw new IllegalArgumentException("Book already in this shelf");
        }

        ShelfBook shelfBook = ShelfBook.builder().bookshelf(shelf).book(book)
                .readingStatus("NOT_STARTED").build();
        return toResponse(shelfBookRepository.save(shelfBook));
    }

    @Transactional
    public void removeBookFromShelf(Long shelfId, Long bookId) {
        getOwnedShelf(shelfId);
        ShelfBook shelfBook = shelfBookRepository.findByBookshelfIdAndBookId(shelfId, bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found in this shelf"));
        shelfBookRepository.delete(shelfBook);
    }

    private ShelfBookResponse toResponse(ShelfBook shelfBook) {
        return ShelfBookResponse.builder()
                .id(shelfBook.getId()).bookId(shelfBook.getBook().getId())
                .title(shelfBook.getBook().getTitle()).author(shelfBook.getBook().getAuthor())
                .coverUrl(shelfBook.getBook().getCoverUrl())
                .addedAt(shelfBook.getAddedAt()).readingStatus(shelfBook.getReadingStatus())
                .notes(shelfBook.getNotes()).build();
    }
}
