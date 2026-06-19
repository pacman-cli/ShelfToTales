package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.application.UnifiedSearchResponse.Facets;
import com.example.shelftotales.ai.application.UnifiedSearchResponse.FacetBucket;
import com.example.shelftotales.ai.application.UnifiedSearchResponse.SearchHit;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FacetAggregatorTest {

    private final FacetAggregator aggregator = new FacetAggregator();

    private static SearchHit hit(long id, String category, String author, String moods) {
        return SearchHit.builder()
                .bookId(id).title("T" + id)
                .categoryName(category)
                .author(author)
                .score(0.1)
                .matchedSources(List.of("text"))
                .price(new BigDecimal("9.99"))
                .build();
    }

    @Test
    void aggregate_emptyInput_returnsEmptyFacets() {
        Facets f = aggregator.aggregate(List.of());
        assertTrue(f.getCategories().isEmpty());
        assertTrue(f.getAuthors().isEmpty());
        assertTrue(f.getMoods().isEmpty());
    }

    @Test
    void aggregate_groupsByCategory() {
        List<SearchHit> hits = List.of(
                hit(1, "Sci", "Sagan", ""),
                hit(2, "Sci", "Hawking", ""),
                hit(3, "Fantasy", "Tolkien", "")
        );
        Facets f = aggregator.aggregate(hits);
        assertEquals(2, f.getCategories().size());
        assertEquals("Sci", f.getCategories().get(0).getName());
        assertEquals(2, f.getCategories().get(0).getCount());
        assertEquals("Fantasy", f.getCategories().get(1).getName());
    }

    @Test
    void aggregate_top10LimitPerDimension() {
        List<SearchHit> hits = new ArrayList<>();
        for (int i = 0; i < 15; i++) hits.add(hit(i, "Cat" + i, "Auth", ""));
        Facets f = aggregator.aggregate(hits);
        assertEquals(10, f.getCategories().size());
    }

    @Test
    void aggregate_tiesBrokenAlphabetically() {
        List<SearchHit> hits = List.of(
                hit(1, "B", "x", ""),
                hit(2, "A", "x", ""),
                hit(3, "A", "x", "")
        );
        Facets f = aggregator.aggregate(hits);
        assertEquals("A", f.getCategories().get(0).getName());
        assertEquals(2, f.getCategories().get(0).getCount());
        assertEquals("B", f.getCategories().get(1).getName());
    }

    @Test
    void aggregate_skipsNullFields() {
        List<SearchHit> hits = List.of(
                hit(1, null, null, null),
                hit(2, "Sci", "Sagan", null)
        );
        Facets f = aggregator.aggregate(hits);
        assertEquals(1, f.getCategories().size());
        assertEquals("Sci", f.getCategories().get(0).getName());
    }
}