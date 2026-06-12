package com.example.shelftotales.recommend;

import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Weighted blend of {@link Ranker} strategies. Each Spring-managed
 * {@link Ranker} bean contributes a candidate list; the service merges
 * them using configurable weights
 * ({@code recommendation.weights.content|collaborative|mood}) and caches
 * the top-N in Redis for the configured TTL. Wired into
 * {@code /api/recommendations/*} via {@link RecommendationController}.
 */
@Service
public class RankingService {

    private final List<Ranker> rankers;
    private final BookRepository bookRepository;
    private final StringRedisTemplate redis;
    private final double wContent;
    private final double wCollab;
    private final double wMood;

    public RankingService(List<Ranker> rankers,
                          BookRepository bookRepository,
                          StringRedisTemplate redis,
                          @Value("${recommendation.weights.content:0.5}") double wContent,
                          @Value("${recommendation.weights.collaborative:0.3}") double wCollab,
                          @Value("${recommendation.weights.mood:0.2}") double wMood) {
        this.rankers = rankers;
        this.bookRepository = bookRepository;
        this.redis = redis;
        this.wContent = wContent;
        this.wCollab = wCollab;
        this.wMood = wMood;
    }

    public List<Recommendation> forUser(Long userId, int limit, Map<String, Object> context) {
        if (userId != null) {
            String cached = safeRedisGet("rec:for-you:" + userId);
            if (cached != null && !cached.isBlank()) {
                List<Long> ids = parseIds(cached);
                if (!ids.isEmpty()) {
                    return resolveBooks(ids, "Popular among readers like you").stream()
                            .limit(limit)
                            .toList();
                }
            }
        }

        Map<Long, Double> blended = new HashMap<>();
        for (Ranker r : rankers) {
            double weight = weightFor(r.name());
            if (weight <= 0) continue;
            for (Map.Entry<Long, Double> e : r.rank(userId, limit, context)) {
                blended.merge(e.getKey(), weight * e.getValue(), Double::sum);
            }
        }
        List<Map.Entry<Long, Double>> sorted = blended.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .toList();

        List<Recommendation> out = new ArrayList<>();
        for (Map.Entry<Long, Double> e : sorted) {
            Book book = bookRepository.findById(e.getKey()).orElse(null);
            if (book != null) {
                out.add(Recommendation.builder()
                        .book(book)
                        .score(e.getValue())
                        .reason(reasonFor(book, e.getValue()))
                        .build());
            }
        }

        if (userId != null) {
            String serialized = sorted.stream().map(e -> String.valueOf(e.getKey()))
                    .collect(Collectors.joining(","));
            try {
                redis.opsForValue().set("rec:for-you:" + userId, serialized, Duration.ofHours(1));
            } catch (RuntimeException ignored) {
                // Redis is optional for this path.
            }
        }
        return out;
    }

    public List<Recommendation> similar(Long bookId, int limit) {
        Book seed = bookRepository.findById(bookId).orElse(null);
        if (seed == null) return List.of();
        Map<String, Object> context = new HashMap<>();
        if (seed.getCategory() != null) context.put("genre", seed.getCategory().getName());
        if (seed.getMoodTags() != null) context.put("mood", seed.getMoodTags());
        return forUser(null, limit, context).stream()
                .filter(r -> !r.getBook().getId().equals(bookId))
                .toList();
    }

    public List<Recommendation> forMood(String mood, int limit) {
        Map<String, Object> context = Map.of("mood", mood);
        return forUser(null, limit, context);
    }

    private double weightFor(String name) {
        return switch (name) {
            case "content" -> wContent;
            case "collaborative" -> wCollab;
            case "mood" -> wMood;
            default -> 0.0;
        };
    }

    private String reasonFor(Book b, double score) {
        if (score >= 0.7) return "Strong match for your reading taste";
        if (score >= 0.4) return "Recommended based on your profile";
        if (b.getCategory() != null) return "Popular in " + b.getCategory().getName();
        return "You may enjoy this";
    }

    private List<Recommendation> resolveBooks(List<Long> ids, String reason) {
        return ids.stream()
                .map(id -> bookRepository.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .map(b -> Recommendation.builder().book(b).reason(reason).build())
                .toList();
    }

    private List<Long> parseIds(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .toList();
    }

    private String safeRedisGet(String key) {
        try {
            return redis.opsForValue().get(key);
        } catch (RuntimeException e) {
            return null;
        }
    }
}
