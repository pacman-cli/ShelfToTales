package com.example.shelftotales.bookshelf.application;

import com.example.shelftotales.bookshelf.domain.ReadingActivity;
import com.example.shelftotales.bookshelf.domain.ReadingStatus;
import com.example.shelftotales.bookshelf.infrastructure.BookshelfRepository;
import com.example.shelftotales.bookshelf.infrastructure.ReadingActivityRepository;
import com.example.shelftotales.bookshelf.infrastructure.ShelfBookRepository;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadingStatsService {

    private final ReadingActivityRepository readingActivityRepository;
    private final BookshelfRepository bookshelfRepository;
    private final ShelfBookRepository shelfBookRepository;
    private final BookRepository bookRepository;

    @Transactional(readOnly = true)
    public List<ReadingActivity> getActiveReadings(Long userId) {
        return safeGet(
            () -> readingActivityRepository.findByUserIdAndStatusOrderByLastReadAtDesc(userId, ReadingStatus.IN_PROGRESS),
            List.of()
        );
    }

    @Transactional(readOnly = true)
    public int getTotalBookshelves(Long userId) {
        return safeGet(
            () -> (int) bookshelfRepository.countByUserId(userId), 0
        );
    }

    @Transactional(readOnly = true)
    public int getCompletedCount(Long userId) {
        return safeGet(
            () -> (int) readingActivityRepository.countByUserIdAndStatus(userId, ReadingStatus.COMPLETED), 0
        );
    }

    @Transactional(readOnly = true)
    public int getPagesRead(Long userId) {
        return safeGet(
            () -> readingActivityRepository.sumTotalPagesReadByUserId(userId), 0
        );
    }

    @Transactional(readOnly = true)
    public int getBooksOwned(Long userId) {
        return safeGet(
            () -> shelfBookRepository.countDistinctBookIdsByUserId(userId), 0
        );
    }

    @Transactional(readOnly = true)
    public int getCategoriesOwned(Long userId) {
        return safeGet(
            () -> bookRepository.countDistinctCategoriesByUserId(userId), 0
        );
    }

    public List<CurrentlyReadingDTO> buildCurrentlyReading(List<ReadingActivity> activities) {
        return activities.stream()
            .map(ra -> CurrentlyReadingDTO.builder()
                .bookId(ra.getBook().getId())
                .title(ra.getBook().getTitle())
                .author(ra.getBook().getAuthor())
                .coverUrl(ra.getBook().getCoverUrl())
                .currentPage(ra.getCurrentPage())
                .totalPagesRead(ra.getTotalPagesRead())
                .status(ra.getStatus())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownDTO> buildCategoryBreakdown(Long userId) {
        return safeGet(() -> bookRepository.findCategoryBreakdownByUserId(userId), List.of());
    }

    private <T> T safeGet(Supplier<T> supplier, T fallback) {
        try {
            return supplier.get();
        } catch (Exception e) {
            log.warn("Reading stats aggregation failed", e);
            return fallback;
        }
    }
}
