package com.example.shelftotales.service;

import com.example.shelftotales.ai.application.*;
import com.example.shelftotales.ai.infrastructure.*;
import com.example.shelftotales.catalog.application.BookResponse;
import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.auth.infrastructure.*;
import com.example.shelftotales.catalog.infrastructure.*;
import com.example.shelftotales.bookshelf.infrastructure.*;
import com.example.shelftotales.review.infrastructure.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscoverFeedServiceTest {

    @Mock
    private BookRepository bookRepository;
    @Mock
    private BookEmbeddingRepository bookEmbeddingRepository;
    @Mock
    private UserProfileVectorRepository profileVectorRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AIService aiService;
    @Mock
    private EmbeddingService embeddingService;
    @Mock
    private ShelfBookRepository shelfBookRepository;
    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private DiscoverFeedService discoverFeedService;

    @Test
    void testGetTrendingWithMockFallback() {
        when(shelfBookRepository.findMostReadBookIds(any(Pageable.class))).thenReturn(Collections.emptyList());
        when(reviewRepository.findTopReviewedBookIds(any(Pageable.class))).thenReturn(Collections.emptyList());

        Book book = Book.builder().id(1L).title("Fallback Book").author("Fallback Author").build();
        Page<Book> fallbackPage = new PageImpl<>(List.of(book));
        when(bookRepository.findAll(any(Pageable.class))).thenReturn(fallbackPage);

        User user = new User();
        user.setId(10L);
        user.setEmail("user@test.com");
        org.springframework.security.core.Authentication auth = mock(org.springframework.security.core.Authentication.class);
        when(auth.getName()).thenReturn("user@test.com");
        when(auth.isAuthenticated()).thenReturn(true);
        org.springframework.security.core.context.SecurityContext secCtx = mock(org.springframework.security.core.context.SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        org.springframework.security.core.context.SecurityContextHolder.setContext(secCtx);

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(profileVectorRepository.findById(10L)).thenReturn(Optional.empty());

        DiscoverFeedResponse response = discoverFeedService.getDiscoverFeed();

        assertNotNull(response);
        assertNotNull(response.getTrending());
        assertEquals(1, response.getTrending().getMostRead().size());
        assertEquals("Fallback Book", response.getTrending().getMostRead().get(0).getTitle());
        assertEquals(1, response.getTrending().getTopReviewed().size());
        assertEquals("Fallback Book", response.getTrending().getTopReviewed().get(0).getTitle());
    }

    @Test
    void testGetTrendingWithRealData() {
        User user = new User();
        user.setId(10L);
        user.setEmail("user@test.com");
        org.springframework.security.core.Authentication auth = mock(org.springframework.security.core.Authentication.class);
        when(auth.getName()).thenReturn("user@test.com");
        when(auth.isAuthenticated()).thenReturn(true);
        org.springframework.security.core.context.SecurityContext secCtx = mock(org.springframework.security.core.context.SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        org.springframework.security.core.context.SecurityContextHolder.setContext(secCtx);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(profileVectorRepository.findById(10L)).thenReturn(Optional.empty());

        when(shelfBookRepository.findMostReadBookIds(any(Pageable.class))).thenReturn(List.of(1L, 2L));
        Book b1 = Book.builder().id(1L).title("Most Read 1").build();
        Book b2 = Book.builder().id(2L).title("Most Read 2").build();
        when(bookRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(b2, b1));

        when(reviewRepository.findTopReviewedBookIds(any(Pageable.class))).thenReturn(List.of(3L));
        Book b3 = Book.builder().id(3L).title("Top Reviewed 1").build();
        when(bookRepository.findAllById(List.of(3L))).thenReturn(List.of(b3));

        when(bookRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(Collections.emptyList()));

        DiscoverFeedResponse response = discoverFeedService.getDiscoverFeed();

        assertNotNull(response);
        assertEquals(2, response.getTrending().getMostRead().size());
        assertEquals(1L, response.getTrending().getMostRead().get(0).getId());
        assertEquals(2L, response.getTrending().getMostRead().get(1).getId());

        assertEquals(1, response.getTrending().getTopReviewed().size());
        assertEquals(3L, response.getTrending().getTopReviewed().get(0).getId());
    }
}
