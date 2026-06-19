package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.application.UnifiedSearchResponse.SearchHit;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PersonalizedRankerTest {

    private final ReviewRepository reviewRepository = mock(ReviewRepository.class);
    private final BookRepository bookRepository = mock(BookRepository.class);
    private final PersonalizedRanker ranker = new PersonalizedRanker(reviewRepository, bookRepository);

    private static Book book(long id, String title, String moodTags) {
        Book b = new Book();
        try {
            Field idField = Book.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(b, id);
            Field titleField = Book.class.getDeclaredField("title");
            titleField.setAccessible(true);
            titleField.set(b, title);
            Field moodField = Book.class.getDeclaredField("moodTags");
            moodField.setAccessible(true);
            moodField.set(b, moodTags);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return b;
    }

    private static SearchHit hit(long id, double rrf) {
        return SearchHit.builder()
                .bookId(id).title("T" + id)
                .author("A").coverUrl("http://x").categoryName("C")
                .price(new BigDecimal("9.99"))
                .score(rrf)
                .matchedSources(java.util.List.of("text"))
                .build();
    }

    @Test
    void rank_anonymousUser_returnsInputUnchanged() {
        List<SearchHit> input = List.of(hit(1, 0.1), hit(2, 0.05));
        PersonalizedRanker.Ranked result = ranker.rank(null, input);
        assertEquals(input, result.results());
        assertFalse(result.personalized());
    }

    @Test
    void rank_userWithNoRecentPositiveReviews_returnsInputUnchanged() {
        User user = new User();
        try {
            Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, 7L);
        } catch (Exception e) { throw new RuntimeException(e); }

        when(reviewRepository.findByUserIdAndRatingGreaterThanEqualAndCreatedAtAfter(
                eq(7L), eq(4), any())).thenReturn(List.of());

        PersonalizedRanker.Ranked result = ranker.rank(user, List.of(hit(1, 0.1)));
        assertFalse(result.personalized());
        assertEquals(1, result.results().size());
    }

    @Test
    void rank_moodOverlapBoostsRelevantResults() {
        User user = new User();
        try {
            Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, 7L);
        } catch (Exception e) { throw new RuntimeException(e); }

        // User has positively reviewed Book A (mood: "reflective, calm")
        Book reviewedA = book(100, "ReviewedA", "reflective, calm");
        Review reviewA = new Review();
        try {
            Field bookField = Review.class.getDeclaredField("book");
            bookField.setAccessible(true);
            bookField.set(reviewA, reviewedA);
        } catch (Exception e) { throw new RuntimeException(e); }
        when(reviewRepository.findByUserIdAndRatingGreaterThanEqualAndCreatedAtAfter(
                eq(7L), eq(4), any())).thenReturn(List.of(reviewA));

        // Two hits: hit1 (no mood overlap), hit2 (mood overlap with "reflective")
        SearchHit hit1 = SearchHit.builder()
                .bookId(1L).title("No overlap").score(0.10)
                .matchedSources(List.of("text"))
                .build();
        SearchHit hit2 = SearchHit.builder()
                .bookId(2L).title("Overlap").score(0.05)
                .matchedSources(List.of("text"))
                .build();
        // Stub the batch lookup: hit1 has no mood, hit2 has "reflective".
        // Use Answer to filter the iterable and return only matching books,
        // since Mockito's default Iterable stub can drop entries that don't
        // match the Set semantics of JpaRepository#findAllById.
        Book stub1 = Book.builder().build();
        Book stub2 = Book.builder().build();
        try {
            Field f1 = Book.class.getDeclaredField("id"); f1.setAccessible(true);
            f1.set(stub1, 1L);
            f1.set(stub2, 2L);
            Field ft = Book.class.getDeclaredField("title"); ft.setAccessible(true);
            ft.set(stub1, "No overlap");
            ft.set(stub2, "Overlap");
            Field fm = Book.class.getDeclaredField("moodTags"); fm.setAccessible(true);
            fm.set(stub2, "reflective");
        } catch (Exception e) { throw new RuntimeException(e); }
        when(bookRepository.findAllById(any())).thenAnswer(inv -> {
            Iterable<Long> ids = inv.getArgument(0);
            java.util.List<Book> out = new java.util.ArrayList<>();
            for (Long id : ids) {
                if (id.equals(1L)) out.add(stub1);
                else if (id.equals(2L)) out.add(stub2);
            }
            return out;
        });
        PersonalizedRanker.Ranked result = ranker.rank(user, List.of(hit1, hit2));

        // result should be reordered with hit2 first (mood overlap boost)
        assertTrue(result.personalized());
        assertEquals(2L, result.results().get(0).getBookId());
    }

    @Test
    void rank_repositoryThrows_returnsInputUnchangedWithPersonalizedFalse() {
        User user = new User();
        try {
            Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, 7L);
        } catch (Exception e) { throw new RuntimeException(e); }

        when(reviewRepository.findByUserIdAndRatingGreaterThanEqualAndCreatedAtAfter(
                anyLong(), anyInt(), any())).thenThrow(new RuntimeException("db down"));

        List<SearchHit> input = List.of(hit(1, 0.1));
        PersonalizedRanker.Ranked result = ranker.rank(user, input);
        assertFalse(result.personalized());
        assertEquals(input, result.results());
    }
}
