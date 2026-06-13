package com.example.shelftotales.bookshelf;

import com.example.shelftotales.bookshelf.application.ReadingProgressService;
import com.example.shelftotales.bookshelf.domain.ReadingActivity;
import com.example.shelftotales.bookshelf.domain.ReadingStatus;
import com.example.shelftotales.bookshelf.infrastructure.ReadingActivityRepository;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.catalog.domain.Book;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ReadingProgressServiceTest {

    private ReadingActivityRepository activityRepository;
    private UserRepository userRepository;
    private BookRepository bookRepository;
    private RedisTemplate<String, Object> redis;
    private ValueOperations<String, Object> valueOps;
    private ReadingProgressService service;

    private static final String CACHE_KEY = "reading-progress:user:1:book:7";

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        activityRepository = mock(ReadingActivityRepository.class);
        userRepository = mock(UserRepository.class);
        bookRepository = mock(BookRepository.class);
        redis = mock(RedisTemplate.class);
        valueOps = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(valueOps);

        service = new ReadingProgressService(activityRepository, userRepository, bookRepository, redis);
    }

    @Test
    void getProgress_returnsCachedValueWithoutHittingDb() {
        ReadingProgressService.CachedProgress cached = new ReadingProgressService.CachedProgress(
                42, 300, LocalDateTime.parse("2026-06-13T10:00:00"));
        when(valueOps.get(CACHE_KEY)).thenReturn(cached);

        ReadingProgressService.Progress result = service.getProgress(1L, 7L);

        assertEquals(42, result.currentPage());
        assertEquals(300, result.totalPages());
        assertEquals(LocalDateTime.parse("2026-06-13T10:00:00"), result.lastReadAt());
        verify(activityRepository, never()).findFirstByUserIdAndBookIdOrderByLastReadAtDesc(anyLong(), anyLong());
    }

    @Test
    void getProgress_cacheMiss_fallsBackToDb_andCachesResult() {
        when(valueOps.get(CACHE_KEY)).thenReturn(null);
        User user = User.builder().id(1L).build();
        Book book = Book.builder().id(7L).build();
        ReadingActivity activity = ReadingActivity.builder()
                .user(user)
                .book(book)
                .currentPage(50)
                .totalPagesRead(50)
                .status(ReadingStatus.IN_PROGRESS)
                .lastReadAt(LocalDateTime.parse("2026-06-12T10:00:00"))
                .build();
        when(activityRepository.findFirstByUserIdAndBookIdOrderByLastReadAtDesc(1L, 7L))
                .thenReturn(Optional.of(activity));

        ReadingProgressService.Progress result = service.getProgress(1L, 7L);

        assertEquals(50, result.currentPage());
        verify(valueOps).set(eq(CACHE_KEY), any(ReadingProgressService.CachedProgress.class), any());
    }

    @Test
    void getProgress_cacheMiss_noActivity_returnsZeroProgress() {
        when(valueOps.get(CACHE_KEY)).thenReturn(null);
        when(activityRepository.findFirstByUserIdAndBookIdOrderByLastReadAtDesc(1L, 7L))
                .thenReturn(Optional.empty());

        ReadingProgressService.Progress result = service.getProgress(1L, 7L);

        assertEquals(0, result.currentPage());
        verify(valueOps, never()).set(anyString(), any(), any());
    }

    @Test
    void saveProgress_persistsAndInvalidatesCache() {
        User user = User.builder().id(1L).build();
        Book book = Book.builder().id(7L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(7L)).thenReturn(Optional.of(book));
        when(activityRepository.findFirstByUserIdAndBookIdOrderByLastReadAtDesc(1L, 7L))
                .thenReturn(Optional.empty());

        ReadingProgressService.Progress result = service.saveProgress(1L, 7L, 99);

        assertEquals(99, result.currentPage());
        ArgumentCaptor<ReadingActivity> captor = ArgumentCaptor.forClass(ReadingActivity.class);
        verify(activityRepository).save(captor.capture());
        assertEquals(99, captor.getValue().getCurrentPage());
        assertEquals(ReadingStatus.IN_PROGRESS, captor.getValue().getStatus());
        verify(redis).delete(CACHE_KEY);
    }

    @Test
    void saveProgress_updatesExistingActivity() {
        User user = User.builder().id(1L).build();
        Book book = Book.builder().id(7L).build();
        ReadingActivity existing = ReadingActivity.builder()
                .id(5L)
                .user(user)
                .book(book)
                .currentPage(10)
                .status(ReadingStatus.IN_PROGRESS)
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bookRepository.findById(7L)).thenReturn(Optional.of(book));
        when(activityRepository.findFirstByUserIdAndBookIdOrderByLastReadAtDesc(1L, 7L))
                .thenReturn(Optional.of(existing));

        ReadingProgressService.Progress result = service.saveProgress(1L, 7L, 50);

        assertEquals(50, result.currentPage());
        verify(activityRepository).save(existing);
        assertEquals(50, existing.getCurrentPage());
    }
}
