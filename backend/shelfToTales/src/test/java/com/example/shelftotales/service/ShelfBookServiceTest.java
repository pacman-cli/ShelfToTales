package com.example.shelftotales.service;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.bookshelf.domain.Bookshelf;
import com.example.shelftotales.bookshelf.domain.ShelfBook;
import com.example.shelftotales.bookshelf.application.ShelfBookResponse;
import com.example.shelftotales.bookshelf.application.ShelfBookService;
import com.example.shelftotales.bookshelf.infrastructure.BookshelfRepository;
import com.example.shelftotales.bookshelf.infrastructure.ShelfBookRepository;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import com.example.shelftotales.bookshelf.application.strategy.ReadingStatusTransitionContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShelfBookServiceTest {

    @Mock private ShelfBookRepository shelfBookRepository;
    @Mock private BookshelfRepository bookshelfRepository;
    @Mock private BookRepository bookRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReadingStatusTransitionContext readingStatusTransitionContext;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private ShelfBookService shelfBookService;

    private User currentUser;
    private Bookshelf bookshelf;
    private ShelfBook shelfBook;
    private Book book;

    @BeforeEach
    void setUp() {
        currentUser = User.builder().id(1L).email("user@example.com").build();
        bookshelf = Bookshelf.builder().id(10L).user(currentUser).build();
        book = Book.builder().id(5L).title("The Great Gatsby").build();
        shelfBook = ShelfBook.builder().id(20L).bookshelf(bookshelf).book(book).readingStatus("NOT_STARTED").build();
    }

    @Test
    void updateReadingStatus_success() {
        try (MockedStatic<AuthUtils> auth = mockStatic(AuthUtils.class)) {
            auth.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(currentUser);
            when(bookshelfRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(bookshelf));
            when(shelfBookRepository.findByBookshelfIdAndBookId(10L, 5L)).thenReturn(Optional.of(shelfBook));
            when(shelfBookRepository.save(any(ShelfBook.class))).thenReturn(shelfBook);

            ShelfBookResponse response = shelfBookService.updateReadingStatus(10L, 5L, "WANT_TO_READ");

            assertNotNull(response);
            verify(readingStatusTransitionContext).transition(shelfBook, "WANT_TO_READ");
            verify(shelfBookRepository).save(shelfBook);
        }
    }

    @Test
    void updateNotes_success() {
        try (MockedStatic<AuthUtils> auth = mockStatic(AuthUtils.class)) {
            auth.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(currentUser);
            when(bookshelfRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(bookshelf));
            when(shelfBookRepository.findByBookshelfIdAndBookId(10L, 5L)).thenReturn(Optional.of(shelfBook));
            when(shelfBookRepository.save(any(ShelfBook.class))).thenReturn(shelfBook);

            ShelfBookResponse response = shelfBookService.updateNotes(10L, 5L, "Reflective book notes.");

            assertNotNull(response);
            assertEquals("Reflective book notes.", shelfBook.getNotes());
            verify(shelfBookRepository).save(shelfBook);
        }
    }
}
