package com.example.shelftotales.bookshelf.application;

import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.bookshelf.domain.ReadingActivity;
import com.example.shelftotales.bookshelf.domain.ReadingStatus;
import com.example.shelftotales.bookshelf.infrastructure.ReadingActivityRepository;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Tracks where a user is in a given book. Postgres is the source of truth;
 * Redis is the hot-path cache used by the read-book page to restore the
 * last page instantly without an extra DB hit on every navigation.
 *
 * <p>Cache key: {@code reading-progress:user:{userId}:book:{bookId}}.
 * TTL is short (15 min) so stale state self-heals even if a write is
 * dropped on the floor. Writes are write-through: the activity row is
 * updated, then the cache entry is invalidated.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReadingProgressService {

    private static final Duration CACHE_TTL = Duration.ofMinutes(15);
    private static final String CACHE_PREFIX = "reading-progress:user:";
    private static final String CACHE_INFIX = ":book:";

    private final ReadingActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final RedisTemplate<String, Object> redis;

    public record Progress(int currentPage, int totalPages, LocalDateTime lastReadAt)
            implements Serializable { }

    /**
     * Serializable cache payload. Kept separate from {@link Progress} so we
     * can evolve the wire DTO without invalidating every cached entry.
     */
    public record CachedProgress(int currentPage, int totalPages, LocalDateTime lastReadAt)
            implements Serializable { }

    private static String cacheKey(long userId, long bookId) {
        return CACHE_PREFIX + userId + CACHE_INFIX + bookId;
    }

    @Transactional(readOnly = true)
    public Progress getProgress(long userId, long bookId) {
        String key = cacheKey(userId, bookId);
        Object cached = redis.opsForValue().get(key);
        if (cached instanceof CachedProgress cp) {
            return new Progress(cp.currentPage(), cp.totalPages(), cp.lastReadAt());
        }
        return activityRepository
                .findFirstByUserIdAndBookIdOrderByLastReadAtDesc(userId, bookId)
                .map(activity -> {
                    Progress p = new Progress(
                            activity.getCurrentPage(),
                            activity.getTotalPagesRead(),
                            activity.getLastReadAt());
                    redis.opsForValue().set(key, new CachedProgress(
                            p.currentPage(), p.totalPages(), p.lastReadAt()), CACHE_TTL);
                    return p;
                })
                .orElseGet(() -> new Progress(0, 0, null));
    }

    @Transactional
    public Progress saveProgress(long userId, long bookId, int currentPage) {
        if (currentPage < 0) {
            throw new IllegalArgumentException("currentPage must be >= 0");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found: " + userId));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("book not found: " + bookId));

        ReadingActivity activity = activityRepository
                .findFirstByUserIdAndBookIdOrderByLastReadAtDesc(userId, bookId)
                .orElseGet(() -> ReadingActivity.builder()
                        .user(user)
                        .book(book)
                        .startedAt(LocalDateTime.now())
                        .totalPagesRead(0)
                        .build());

        activity.setCurrentPage(currentPage);
        activity.setTotalPagesRead(Math.max(activity.getTotalPagesRead(), currentPage));
        activity.setLastReadAt(LocalDateTime.now());
        activity.setStatus(currentPage > 0 ? ReadingStatus.IN_PROGRESS : ReadingStatus.NOT_STARTED);

        activityRepository.save(activity);

        // Write-through: drop the cache so the next read picks up the new value
        // from Postgres. We don't pre-populate to keep the read path simple.
        redis.delete(cacheKey(userId, bookId));

        log.debug("Saved reading progress user={} book={} page={}", userId, bookId, currentPage);
        return new Progress(activity.getCurrentPage(), activity.getTotalPagesRead(), activity.getLastReadAt());
    }
}
