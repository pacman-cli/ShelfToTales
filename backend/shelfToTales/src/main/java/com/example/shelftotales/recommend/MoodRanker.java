package com.example.shelftotales.recommend;

import com.example.shelftotales.ai.application.AIService;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Mood-driven ranker: derives a mood vector from the request context, then
 * surfaces books whose mood tags overlap with the request.
 */
@Component
@RequiredArgsConstructor
public class MoodRanker implements Ranker {

    private final BookRepository bookRepository;
    private final AIService aiService;

    @Override
    public String name() { return "mood"; }

    @Override
    public List<Map.Entry<Long, Double>> rank(Long userId, int limit, Map<String, Object> context) {
        if (context == null) return List.of();
        String mood = context.get("mood") instanceof String m ? m : null;
        if (mood == null || mood.isBlank()) return List.of();

        Set<String> moods = aiService.extractMoods(mood);
        List<Book> all = bookRepository.findAll();
        List<Map.Entry<Long, Double>> scored = new ArrayList<>();
        for (Book b : all) {
            if (b.getMoodTags() == null) continue;
            Set<String> bookMoods = new HashSet<>(Arrays.asList(b.getMoodTags().toLowerCase().split(",")));
            bookMoods.removeIf(String::isBlank);
            Set<String> intersection = new HashSet<>(bookMoods);
            intersection.retainAll(moods);
            if (intersection.isEmpty()) continue;
            double score = intersection.size() / (double) moods.size();
            scored.add(Map.entry(b.getId(), score));
        }
        scored.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
        return scored.stream().limit(limit).toList();
    }
}
