package com.example.shelftotales.ai.presentation;

import com.example.shelftotales.ai.application.SpoilerAssessmentResponse;
import com.example.shelftotales.ai.application.SpoilerDetectionService;
import com.example.shelftotales.ai.domain.SpoilerAssessment;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class SpoilerController {

    private final SpoilerDetectionService spoilerDetectionService;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @PostMapping("/{reviewId}/spoiler-check")
    public ResponseEntity<SpoilerAssessmentResponse> recheck(@PathVariable Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));
        Long userId = AuthUtils.getCurrentUser(userRepository).getId();
        SpoilerAssessment assessment = spoilerDetectionService.assessAndPersist(
                reviewId, userId, review.getComment());
        return ResponseEntity.ok(toResponse(assessment));
    }

    @GetMapping("/{reviewId}/spoiler")
    public ResponseEntity<SpoilerAssessmentResponse> latest(@PathVariable Long reviewId) {
        Optional<SpoilerAssessment> assessment = spoilerDetectionService.getLatest(reviewId);
        return assessment
                .map(a -> ResponseEntity.ok(toResponse(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private SpoilerAssessmentResponse toResponse(SpoilerAssessment a) {
        return SpoilerAssessmentResponse.builder()
                .reviewId(a.getReviewId())
                .spoilerLevel(a.getSpoilerLevel() == null ? null : a.getSpoilerLevel().name())
                .spoilerScore(a.getSpoilerScore())
                .sentences(a.getSpoilerSentences())
                .sanitizedReview(a.getSanitizedReview())
                .model(a.getModel())
                .latencyMs(a.getLatencyMs())
                .build();
    }
}
