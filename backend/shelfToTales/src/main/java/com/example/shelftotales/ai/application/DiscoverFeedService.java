package com.example.shelftotales.ai.application;
import com.example.shelftotales.ai.domain.UserProfileVector;
import com.example.shelftotales.ai.infrastructure.*;
import com.example.shelftotales.catalog.application.*;

import com.example.shelftotales.catalog.application.BookResponse;
import com.example.shelftotales.ai.application.DiscoverFeedResponse;
import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.bookshelf.domain.*;
import com.example.shelftotales.auth.infrastructure.*;
import com.example.shelftotales.catalog.infrastructure.*;
import com.example.shelftotales.bookshelf.infrastructure.*;
import com.example.shelftotales.wishlist.infrastructure.*;
import com.example.shelftotales.review.infrastructure.*;
import com.example.shelftotales.shared.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscoverFeedService {

    private final BookRepository bookRepository;
    private final BookEmbeddingRepository bookEmbeddingRepository;
    private final UserProfileVectorRepository profileVectorRepository;
    private final UserRepository userRepository;
    private final AIService aiService;
    private final EmbeddingService embeddingService;
    private final ShelfBookRepository shelfBookRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public DiscoverFeedResponse getDiscoverFeed() {
        User currentUser = AuthUtils.getCurrentUser(userRepository);
        return DiscoverFeedResponse.builder()
                .forYou(getForYou(currentUser.getId()))
                .trending(getTrending())
                .build();
    }

    private List<DiscoverFeedResponse.RecommendedBook> getForYou(Long userId) {
        Optional<UserProfileVector> profileOpt = profileVectorRepository.findById(userId);
        if (profileOpt.isEmpty()) {
            return bookRepository.findAll(PageRequest.of(0, 5)).stream()
                    .map(b -> DiscoverFeedResponse.RecommendedBook.builder()
                            .bookId(b.getId()).title(b.getTitle()).author(b.getAuthor())
                            .coverUrl(b.getCoverUrl()).score(0.5).reason("Popular on ShelfToTales").build())
                    .collect(Collectors.toList());
        }

        double[] userVec = aiService.stringToVector(profileOpt.get().getVectorData());
        List<Long> matchedIds = embeddingService.getSimilarBookIds(userVec, 5);
        if (matchedIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<BookEmbedding> embeddings = bookEmbeddingRepository.findAllById(matchedIds);

        return embeddings.stream()
                .map(emb -> Map.entry(emb.getBook(),
                        aiService.calculateSimilarity(userVec, aiService.stringToVector(emb.getVectorData()))))
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .map(e -> DiscoverFeedResponse.RecommendedBook.builder()
                        .bookId(e.getKey().getId()).title(e.getKey().getTitle())
                        .author(e.getKey().getAuthor()).coverUrl(e.getKey().getCoverUrl())
                        .score(e.getValue()).reason("Matches your reading taste").build())
                .collect(Collectors.toList());
    }

    private DiscoverFeedResponse.TrendingSection getTrending() {
        List<Long> mostReadIds = shelfBookRepository.findMostReadBookIds(PageRequest.of(0, 5));
        List<Book> mostReadBooks;
        if (mostReadIds.isEmpty()) {
            mostReadBooks = bookRepository.findAll(PageRequest.of(0, 5)).getContent();
        } else {
            mostReadBooks = bookRepository.findAllById(mostReadIds);
            Map<Long, Book> bookMap = mostReadBooks.stream().collect(Collectors.toMap(Book::getId, b -> b));
            mostReadBooks = mostReadIds.stream().map(bookMap::get).filter(Objects::nonNull).collect(Collectors.toList());
        }

        List<Long> topReviewedIds = reviewRepository.findTopReviewedBookIds(PageRequest.of(0, 5));
        List<Book> topReviewedBooks;
        if (topReviewedIds.isEmpty()) {
            topReviewedBooks = bookRepository.findAll(PageRequest.of(0, 5)).getContent();
        } else {
            topReviewedBooks = bookRepository.findAllById(topReviewedIds);
            Map<Long, Book> bookMap = topReviewedBooks.stream().collect(Collectors.toMap(Book::getId, b -> b));
            topReviewedBooks = topReviewedIds.stream().map(bookMap::get).filter(Objects::nonNull).collect(Collectors.toList());
        }

        List<BookResponse> mostReadResponses = mostReadBooks.stream()
                .map(b -> BookResponse.builder().id(b.getId()).title(b.getTitle())
                        .author(b.getAuthor()).coverUrl(b.getCoverUrl()).build())
                .collect(Collectors.toList());

        List<BookResponse> topReviewedResponses = topReviewedBooks.stream()
                .map(b -> BookResponse.builder().id(b.getId()).title(b.getTitle())
                        .author(b.getAuthor()).coverUrl(b.getCoverUrl()).build())
                .collect(Collectors.toList());

        return DiscoverFeedResponse.TrendingSection.builder()
                .mostRead(mostReadResponses)
                .topReviewed(topReviewedResponses)
                .build();
    }
}
