package com.example.shelftotales.review.application;

import com.example.shelftotales.ai.application.ReviewModerationService;
import com.example.shelftotales.ai.application.SpoilerAnalysisResponse;
import com.example.shelftotales.review.domain.ModeratedReview;
import com.example.shelftotales.review.infrastructure.ModeratedReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewSubmissionService {

    private final VectorStore vectorStore;
    private final ReviewModerationService reviewModerationService;
    private final ModeratedReviewRepository reviewRepository;

    @Transactional
    public ModeratedReview submitReview(Long bookId, String userId, String reviewText) {
        log.info("Submitting review for bookId={}, userId={}", bookId, userId);

        SearchRequest searchRequest = SearchRequest.builder()
                .query(reviewText)
                .build();

        List<Document> contextChunks = vectorStore.similaritySearch(searchRequest);

        String bookContext = contextChunks.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        if (bookContext.isBlank()) {
            bookContext = "No book context available for this book.";
            log.warn("No vector store context found for bookId={}", bookId);
        } else {
            log.info("Retrieved {} context chunks for bookId={}", contextChunks.size(), bookId);
        }

        SpoilerAnalysisResponse analysis = reviewModerationService.analyzeReview(bookContext, reviewText);

        ModeratedReview review = ModeratedReview.builder()
                .bookId(bookId)
                .userId(userId)
                .text(reviewText)
                .isSpoiler(analysis.isSpoiler())
                .createdAt(LocalDateTime.now())
                .build();

        ModeratedReview savedReview = reviewRepository.save(review);

        log.info("Review saved: id={}, isSpoiler={}, reasoning={}",
                savedReview.getId(), analysis.isSpoiler(), analysis.reasoning());

        return savedReview;
    }
}
