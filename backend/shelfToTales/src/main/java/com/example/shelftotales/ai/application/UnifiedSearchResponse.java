package com.example.shelftotales.ai.application;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UnifiedSearchResponse {
    private String query;
    private List<SearchHit> results;
    private int total;
    private Signals signals;
    private Facets facets;
    private boolean personalized;
    private boolean imageMatched;
    private String nextCursor;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SearchHit {
        private Long bookId;
        private String title;
        private String author;
        private String coverUrl;
        private String categoryName;
        private BigDecimal price;
        private Double score;
        private List<String> matchedSources;
        private Double semanticScore;
        private Integer textRank;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Signals {
        private String text;
        private String semantic;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Facets {
        private List<FacetBucket> categories;
        private List<FacetBucket> authors;
        private List<FacetBucket> moods;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FacetBucket {
        private String name;
        private int count;
    }
}
