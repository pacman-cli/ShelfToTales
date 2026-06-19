package com.example.shelftotales.controller;

import com.example.shelftotales.ai.application.EmbeddingService;
import com.example.shelftotales.ai.application.PersonalizedRanker;
import com.example.shelftotales.ai.application.UnifiedSearchService;
import com.example.shelftotales.ai.presentation.SemanticSearchController;
import com.example.shelftotales.ai.rag.EmbeddingIndexer;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SemanticSearchControllerUnitTest {

    @Test
    void reindex_rebuildsBookEmbeddingsAndRagChunks() {
        PersonalizedRanker ranker = new PersonalizedRanker(
                org.mockito.Mockito.mock(ReviewRepository.class),
                org.mockito.Mockito.mock(BookRepository.class));
        SemanticSearchController controller = new SemanticSearchController(
                new FakeEmbeddingService(3),
                null,
                null,
                null,
                new FakeEmbeddingIndexer(8),
                null,
                new UnifiedSearchService(),
                ranker
        );

        ResponseEntity<Map<String, Object>> response = controller.reindex();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(3, response.getBody().get("indexed"));
        assertEquals(8, response.getBody().get("chunksIndexed"));
    }

    private static class FakeEmbeddingService extends EmbeddingService {
        private final int count;

        FakeEmbeddingService(int count) {
            super(null, null, null, null, null, null, null);
            this.count = count;
        }

        @Override
        public int reindexAll() {
            return count;
        }
    }

    private static class FakeEmbeddingIndexer extends EmbeddingIndexer {
        private final int count;

        FakeEmbeddingIndexer(int count) {
            super(null, null, null, null);
            this.count = count;
        }

        @Override
        public int reindexAll() {
            return count;
        }
    }
}
