package com.example.shelftotales.recommend;

import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Item-item collaborative ranker using Jaccard similarity over the
 * "users who reviewed this book also reviewed" set. Cheap, cacheable,
 * and acceptable as a single signal alongside the content-based ranker.
 */
@Component
@RequiredArgsConstructor
public class CollaborativeRanker implements Ranker {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;

    @Override
    public String name() { return "collaborative"; }

    @Override
    public List<Map.Entry<Long, Double>> rank(Long userId, int limit, Map<String, Object> context) {
        if (userId == null) return List.of();
        List<Long> userBooks = reviewRepository.findBookIdsByUserId(userId);
        if (userBooks.isEmpty()) return List.of();

        Map<Long, Set<Long>> itemUsers = new HashMap<>();
        for (Long bookId : userBooks) {
            reviewRepository.findUserIdsByBookId(bookId)
                    .forEach(uid -> itemUsers.computeIfAbsent(bookId, k -> new HashSet<>()).add(uid));
        }

        // Candidate set: books reviewed by anyone who reviewed the user's books, minus the user's own.
        Map<Long, Integer> candidateCount = new HashMap<>();
        Map<Long, Integer> overlapCount = new HashMap<>();
        for (Map.Entry<Long, Set<Long>> e : itemUsers.entrySet()) {
            for (Long otherUid : e.getValue()) {
                if (otherUid.equals(userId)) continue;
                for (Long otherBook : reviewRepository.findBookIdsByUserId(otherUid)) {
                    if (userBooks.contains(otherBook)) continue;
                    candidateCount.merge(otherBook, 1, Integer::sum);
                    overlapCount.merge(otherBook, 1, Integer::sum);
                }
            }
        }

        return candidateCount.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(e -> {
                    int total = e.getValue();
                    // Jaccard-ish: overlap / max(overlap, candidate total in this slice).
                    double jaccard = total > 0 ? Math.min(1.0, total / (double) (userBooks.size() + total)) : 0.0;
                    return Map.entry(e.getKey(), jaccard);
                })
                .toList();
    }
}
