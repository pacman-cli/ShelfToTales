package com.example.shelftotales.service;

import com.example.shelftotales.dto.ShelfBookResponse;
import com.example.shelftotales.model.Book;
import com.example.shelftotales.model.Bookshelf;
import com.example.shelftotales.model.ShelfBook;
import com.example.shelftotales.model.User;
import com.example.shelftotales.repository.BookRepository;
import com.example.shelftotales.repository.BookshelfRepository;
import com.example.shelftotales.repository.ShelfBookRepository;
import com.example.shelftotales.repository.UserRepository;
import com.example.shelftotales.util.AuthUtils;
import lombok.RequiredArgsConstructor;
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

    private Bookshelf getOwnedShelf(Long shelfId) {
        User user = AuthUtils.getCurrentUser(userRepository);
        return bookshelfRepository.findByIdAndUserId(shelfId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bookshelf not found: " + shelfId));
    }

    @Transactional(readOnly = true)
    public List<ShelfBookResponse> getShelfBooks(Long shelfId) {
        getOwnedShelf(shelfId);
        return shelfBookRepository.findByBookshelfIdWithBook(shelfId)
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