package com.example.shelftotales.ai;

import com.example.shelftotales.ai.application.LlmSpamClassifier;
import com.example.shelftotales.ai.application.SpamDetectionService;
import com.example.shelftotales.ai.domain.SpamAssessment;
import com.example.shelftotales.ai.domain.SpamLevel;
import com.example.shelftotales.ai.infrastructure.SpamAssessmentRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SpamDetectionServiceTest {

    @Mock
    private LlmSpamClassifier llmClassifier;

    @Mock
    private SpamAssessmentRepository assessmentRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private SpamDetectionService spamDetectionService;

    @Test
    void assessAndPersist_blankText_returnsSafeAssessment() {
        Long reviewId = 1L;
        Long userId = 10L;

        SpamAssessment emptyAssessment = SpamAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spamLevel(SpamLevel.SAFE)
                .spamScore(BigDecimal.ZERO)
                .spamReasons(List.of())
                .model("mock-model")
                .build();

        when(llmClassifier.classify(reviewId, userId, null)).thenReturn(emptyAssessment);
        when(assessmentRepository.save(any(SpamAssessment.class))).thenAnswer(inv -> inv.getArgument(0));

        SpamAssessment result = spamDetectionService.assessAndPersist(reviewId, userId, null);

        assertNotNull(result);
        assertEquals(SpamLevel.SAFE, result.getSpamLevel());
        assertEquals(BigDecimal.ZERO, result.getSpamScore());
        assertTrue(result.getSpamReasons().isEmpty());
        verify(llmClassifier).classify(reviewId, userId, null);
        verify(assessmentRepository).save(any(SpamAssessment.class));
        verify(reviewRepository, never()).save(any(Review.class));
    }

    @Test
    void assessAndPersist_safeReview_persistsAndUpdatesReview() {
        Long reviewId = 2L;
        Long userId = 20L;
        String text = "Great book! I really enjoyed the characters and plot.";

        SpamAssessment safeAssessment = SpamAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spamLevel(SpamLevel.SAFE)
                .spamScore(new BigDecimal("0.05"))
                .spamReasons(List.of())
                .model("mock-model")
                .build();

        Review review = Review.builder().id(reviewId).build();

        when(llmClassifier.classify(reviewId, userId, text)).thenReturn(safeAssessment);
        when(assessmentRepository.save(any(SpamAssessment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        SpamAssessment result = spamDetectionService.assessAndPersist(reviewId, userId, text);

        assertEquals(SpamLevel.SAFE, result.getSpamLevel());
        assertEquals(new BigDecimal("0.05"), result.getSpamScore());

        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());
        Review savedReview = reviewCaptor.getValue();
        assertEquals(SpamLevel.SAFE, savedReview.getSpamLevel());
        assertFalse(savedReview.isSpam());
    }

    @Test
    void assessAndPersist_spamReview_marksReviewAsSpam() {
        Long reviewId = 3L;
        Long userId = 30L;
        String text = "BUY NOW!!! Click here for discount!!! http://spam.com";

        SpamAssessment spamAssessment = SpamAssessment.builder()
                .reviewId(reviewId)
                .userId(userId)
                .spamLevel(SpamLevel.SPAM)
                .spamScore(new BigDecimal("0.95"))
                .spamReasons(List.of("Promotional content", "Excessive punctuation"))
                .model("mock-model")
                .build();

        Review review = Review.builder().id(reviewId).build();

        when(llmClassifier.classify(reviewId, userId, text)).thenReturn(spamAssessment);
        when(assessmentRepository.save(any(SpamAssessment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        SpamAssessment result = spamDetectionService.assessAndPersist(reviewId, userId, text);

        assertEquals(SpamLevel.SPAM, result.getSpamLevel());
        assertEquals(new BigDecimal("0.95"), result.getSpamScore());
        assertEquals(2, result.getSpamReasons().size());

        ArgumentCaptor<Review> reviewCaptor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(reviewCaptor.capture());
        Review savedReview = reviewCaptor.getValue();
        assertEquals(SpamLevel.SPAM, savedReview.getSpamLevel());
        assertTrue(savedReview.isSpam());
    }

    @Test
    void getLatest_delegatesToRepository() {
        Long reviewId = 5L;
        SpamAssessment assessment = SpamAssessment.builder()
                .reviewId(reviewId)
                .spamLevel(SpamLevel.SAFE)
                .build();

        when(assessmentRepository.findByReviewId(reviewId)).thenReturn(Optional.of(assessment));

        Optional<SpamAssessment> result = spamDetectionService.getLatest(reviewId);

        assertTrue(result.isPresent());
        assertEquals(SpamLevel.SAFE, result.get().getSpamLevel());
        verify(assessmentRepository).findByReviewId(reviewId);
    }

    @Test
    void getLatest_returnsEmptyWhenNotFound() {
        when(assessmentRepository.findByReviewId(99L)).thenReturn(Optional.empty());

        Optional<SpamAssessment> result = spamDetectionService.getLatest(99L);

        assertTrue(result.isEmpty());
        verify(assessmentRepository).findByReviewId(99L);
    }
}
