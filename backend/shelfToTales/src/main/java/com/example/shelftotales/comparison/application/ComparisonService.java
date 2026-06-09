package com.example.shelftotales.comparison.application;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.catalog.application.BookResponse;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.comparison.domain.ComparisonItem;
import com.example.shelftotales.comparison.infrastructure.ComparisonRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComparisonService {
    private final ComparisonRepository comparisonRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BookResponse> getUserComparisonList() {
        User user = AuthUtils.getCurrentUser(userRepository);
        return comparisonRepository.findByUserIdWithBook(user.getId())
                .stream()
                .map(item -> toBookResponse(item.getBook()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToComparison(Long bookId) {
        User user = AuthUtils.getCurrentUser(userRepository);
        
        long count = comparisonRepository.countByUserId(user.getId());
        if (count >= 4) {
            throw new IllegalArgumentException("You can only compare up to 4 books at a time");
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        try {
            comparisonRepository.save(ComparisonItem.builder()
                    .user(user)
                    .book(book)
                    .build());
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Book already in comparison list");
        }
    }

    @Transactional
    public void removeFromComparison(Long bookId) {
        User user = AuthUtils.getCurrentUser(userRepository);
        comparisonRepository.deleteByUserIdAndBookId(user.getId(), bookId);
    }

    @Transactional
    public void clearComparison() {
        User user = AuthUtils.getCurrentUser(userRepository);
        comparisonRepository.deleteByUserId(user.getId());
    }

    private BookResponse toBookResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .description(book.getDescription())
                .coverUrl(book.getCoverUrl())
                .publishedDate(book.getPublishedDate())
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .pdfUrl(book.getPdfUrl())
                .previewAvailable(book.isPreviewAvailable())
                .price(book.getPrice())
                .stock(book.getStock())
                .moodTags(book.getMoodTags())
                .build();
    }
}
