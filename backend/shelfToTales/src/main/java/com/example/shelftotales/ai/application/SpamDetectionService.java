package com.example.shelftotales.ai.application;

import com.example.shelftotales.ai.domain.SpamAssessment;
import com.example.shelftotales.ai.domain.SpamLevel;
import com.example.shelftotales.ai.infrastructure.SpamAssessmentRepository;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.review.domain.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpamDetectionService {

    private final LlmSpamClassifier llmClassifier;
    private final SpamAssessmentRepository assessmentRepository;
    private final ReviewRepository reviewRepository;

    @Value("${ai.spam.provider:llm}")
    private String provider;

    @Transactional
    public SpamAssessment assessAndPersist(Long reviewId, Long userId, String text) {
        long start = System.currentTimeMillis();
        SpamAssessment assessment = llmClassifier.classify(reviewId, userId, text);
        long latency = System.currentTimeMillis() - start;
        assessment.setLatencyMs((int) latency);

        SpamAssessment saved = assessmentRepository.save(assessment);

        reviewRepository.findById(reviewId).ifPresent(review -> {
            review.setSpamLevel(saved.getSpamLevel());
            review.setSpam(saved.getSpamLevel() != SpamLevel.SAFE);
            reviewRepository.save(review);
        });

        log.info("Spam assessment for review={} level={} score={} latencyMs={} model={}",
                reviewId, saved.getSpamLevel(), saved.getSpamScore(), latency, saved.getModel());
        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<SpamAssessment> getLatest(Long reviewId) {
        return assessmentRepository.findByReviewId(reviewId);
    }
}
