package com.example.shelftotales.service;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.domain.Role;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.catalog.application.BookResponse;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.domain.Category;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.comparison.application.ComparisonService;
import com.example.shelftotales.comparison.domain.ComparisonItem;
import com.example.shelftotales.comparison.infrastructure.ComparisonRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComparisonServiceTest {

    @Mock private ComparisonRepository comparisonRepository;
    @Mock private BookRepository bookRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ComparisonService comparisonService;

    private User testUser;
    private Book testBook;
    private Category testCategory;
    private ComparisonItem testItem;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .fullName("Test User")
                .role(Role.USER)
                .build();

        testCategory = Category.builder()
                .id(10L)
                .name("Fiction")
                .build();

        testBook = Book.builder()
                .id(100L)
                .title("Test Book")
                .author("Test Author")
                .price(BigDecimal.valueOf(19.99))
                .category(testCategory)
                .build();

        testItem = ComparisonItem.builder()
                .id(1000L)
                .user(testUser)
                .book(testBook)
                .build();
    }

    @Test
    void getUserComparisonList_returnsBooks() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);
            when(comparisonRepository.findByUserIdWithBook(testUser.getId()))
                    .thenReturn(Collections.singletonList(testItem));

            List<BookResponse> result = comparisonService.getUserComparisonList();

            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals(testBook.getId(), result.get(0).getId());
            assertEquals(testBook.getTitle(), result.get(0).getTitle());
            assertEquals("Fiction", result.get(0).getCategoryName());
        }
    }

    @Test
    void addToComparison_succeeds() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);
            when(comparisonRepository.countByUserId(testUser.getId())).thenReturn(2L);
            when(bookRepository.findById(testBook.getId())).thenReturn(Optional.of(testBook));
            when(comparisonRepository.save(any(ComparisonItem.class))).thenReturn(testItem);

            assertDoesNotThrow(() -> comparisonService.addToComparison(testBook.getId()));
            verify(comparisonRepository, times(1)).save(any(ComparisonItem.class));
        }
    }

    @Test
    void addToComparison_throwsWhenListFull() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);
            when(comparisonRepository.countByUserId(testUser.getId())).thenReturn(4L);

            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> comparisonService.addToComparison(testBook.getId()));

            assertEquals("You can only compare up to 4 books at a time", exception.getMessage());
            verify(comparisonRepository, never()).save(any(ComparisonItem.class));
        }
    }

    @Test
    void addToComparison_throwsWhenDuplicate() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);
            when(comparisonRepository.countByUserId(testUser.getId())).thenReturn(1L);
            when(bookRepository.findById(testBook.getId())).thenReturn(Optional.of(testBook));
            when(comparisonRepository.save(any(ComparisonItem.class)))
                    .thenThrow(new DataIntegrityViolationException("Duplicate"));

            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> comparisonService.addToComparison(testBook.getId()));

            assertEquals("Book already in comparison list", exception.getMessage());
        }
    }

    @Test
    void removeFromComparison_succeeds() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);

            comparisonService.removeFromComparison(testBook.getId());

            verify(comparisonRepository, times(1))
                    .deleteByUserIdAndBookId(testUser.getId(), testBook.getId());
        }
    }

    @Test
    void clearComparison_succeeds() {
        try (MockedStatic<AuthUtils> authUtils = mockStatic(AuthUtils.class)) {
            authUtils.when(() -> AuthUtils.getCurrentUser(userRepository)).thenReturn(testUser);

            comparisonService.clearComparison();

            verify(comparisonRepository, times(1)).deleteByUserId(testUser.getId());
        }
    }
}
