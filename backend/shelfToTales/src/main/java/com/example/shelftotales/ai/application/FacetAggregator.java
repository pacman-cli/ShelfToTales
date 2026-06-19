package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.application.UnifiedSearchResponse.FacetBucket;
import com.example.shelftotales.ai.application.UnifiedSearchResponse.Facets;
import com.example.shelftotales.ai.application.UnifiedSearchResponse.SearchHit;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class FacetAggregator {

    private static final int TOP_N = 10;

    public Facets aggregate(List<SearchHit> hits) {
        if (hits == null || hits.isEmpty()) {
            return Facets.builder()
                    .categories(List.of())
                    .authors(List.of())
                    .moods(List.of())
                    .build();
        }
        return Facets.builder()
                .categories(topBuckets(hits, h -> h.getCategoryName()))
                .authors(topBuckets(hits, SearchHit::getAuthor))
                .moods(topBucketsFromMoods(hits))
                .build();
    }

    private List<FacetBucket> topBuckets(List<SearchHit> hits, java.util.function.Function<SearchHit, String> field) {
        Map<String, Long> counts = hits.stream()
                .map(field)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
        return topN(counts);
    }

    private List<FacetBucket> topBucketsFromMoods(List<SearchHit> hits) {
        // SearchHit doesn't carry moodTags in this round; return empty.
        // (Full impl would join on Book.moodTags by id; deferred.)
        return List.of();
    }

    private List<FacetBucket> topN(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .sorted(Comparator.<Map.Entry<String, Long>>comparingLong(Map.Entry::getValue).reversed()
                        .thenComparing(Map.Entry::getKey))
                .limit(TOP_N)
                .map(e -> FacetBucket.builder().name(e.getKey()).count(e.getValue().intValue()).build())
                .collect(Collectors.toList());
    }
}