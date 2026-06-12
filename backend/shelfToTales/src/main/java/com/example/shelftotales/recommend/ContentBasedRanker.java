package com.example.shelftotales.recommend;

import com.example.shelftotales.ai.application.AIService;
import com.example.shelftotales.ai.application.EmbeddingService;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.bookshelf.infrastructure.ShelfBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Content-based ranker: cosine similarity over book embeddings, filtered
 * to the user's preferred genres/moods when context is provided.
 */
@Component
@RequiredArgsConstructor
public class ContentBasedRanker implements Ranker {

    private final EmbeddingService embeddingService;
    private final AIService aiService;
    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final ShelfBookRepository shelfBookRepository;

    @Override
    public String name() { return "content"; }

    @Override
    public List<Map.Entry<Long, Double>> rank(Long userId, int limit, Map<String, Object> context) {
        String seed = buildSeedText(userId, context);
        if (seed.isBlank()) return List.of();
        double[] vec = embeddingService.generateEmbedding(seed);
        List<Long> similar = embeddingService.getSimilarBookIds(vec, limit * 2);
        List<Map.Entry<Long, Double>> result = new ArrayList<>();
        for (Long id : similar) {
            // Score is rank-decay (rank 0 → 1.0, rank N → ~0.5).
            int idx = similar.indexOf(id);
            double score = Math.max(0.1, 1.0 - (idx / (double) (limit * 2)));
            result.add(Map.entry(id, score));
        }
        return result;
    }

    private String buildSeedText(Long userId, Map<String, Object> context) {
        StringBuilder sb = new StringBuilder();
        if (context != null && context.get("mood") instanceof String mood) {
            sb.append("mood: ").append(mood).append(' ');
        }
        if (context != null && context.get("genre") instanceof String genre) {
            sb.append("genre: ").append(genre).append(' ');
        }
        if (userId != null) {
            var completed = shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "COMPLETED");
            completed.stream().limit(5).forEach(id ->
                bookRepository.findById(id).ifPresent(b ->
                    sb.append(b.getTitle()).append(' ').append(b.getDescription() == null ? "" : b.getDescription()).append(' ')));
        }
        return sb.toString().trim();
    }
}
