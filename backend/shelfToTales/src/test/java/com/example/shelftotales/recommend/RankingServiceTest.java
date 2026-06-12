package com.example.shelftotales.recommend;

import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.domain.Category;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RankingServiceTest {

    @Test
    void blendsRankersByWeights() {
        Book book = Book.builder().id(1L).title("Test").category(Category.builder().id(10L).name("Fiction").build()).build();
        BookRepository bookRepository = mock(BookRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        when(bookRepository.findById(1L)).thenReturn(java.util.Optional.of(book));

        ContentBasedRanker content = mock(ContentBasedRanker.class);
        CollaborativeRanker collab = mock(CollaborativeRanker.class);
        MoodRanker mood = mock(MoodRanker.class);
        when(content.name()).thenReturn("content");
        when(collab.name()).thenReturn("collaborative");
        when(mood.name()).thenReturn("mood");
        when(content.rank(any(), anyInt(), any())).thenReturn(List.of(Map.entry(1L, 0.8)));
        when(collab.rank(any(), anyInt(), any())).thenReturn(List.of(Map.entry(1L, 0.5)));
        when(mood.rank(any(), anyInt(), any())).thenReturn(List.of());

        RankingService service = new RankingService(List.of(content, collab, mood), bookRepository, redis, 0.5, 0.3, 0.2);
        List<Recommendation> recs = service.forUser(null, 5, Map.of());
        assertEquals(1, recs.size());
        Recommendation r = recs.get(0);
        // 0.5*0.8 + 0.3*0.5 = 0.4 + 0.15 = 0.55
        assertEquals(0.55, r.getScore(), 0.01);
        assertNotNull(r.getReason());
    }

    @Test
    void returnsEmptyWhenNoRankersContribute() {
        BookRepository bookRepository = mock(BookRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        ContentBasedRanker content = mock(ContentBasedRanker.class);
        when(content.name()).thenReturn("content");
        when(content.rank(any(), anyInt(), any())).thenReturn(List.of());
        RankingService service = new RankingService(List.of(content), bookRepository, redis, 0.5, 0.3, 0.2);
        assertTrue(service.forUser(null, 5, Map.of()).isEmpty());
    }
}
