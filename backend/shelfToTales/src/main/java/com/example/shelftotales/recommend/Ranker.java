package com.example.shelftotales.recommend;

import com.example.shelftotales.catalog.domain.Book;

import java.util.List;
import java.util.Map;

/**
 * Strategy interface for the recommendation engine. Each implementation
 * contributes a candidate list keyed by book id with a score in [0, 1].
 * The {@link RankingService} blends the strategies.
 */
public interface Ranker {
    String name();
    List<Map.Entry<Long, Double>> rank(Long userId, int limit, Map<String, Object> context);
    default Book resolve(Long bookId) { return null; }
}
