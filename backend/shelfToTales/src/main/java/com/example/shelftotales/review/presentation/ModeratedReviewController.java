package com.example.shelftotales.review.presentation;

import com.example.shelftotales.review.application.ReviewSubmissionService;
import com.example.shelftotales.review.domain.ModeratedReview;
import com.example.shelftotales.review.infrastructure.ModeratedReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ModeratedReviewController {

    private final ReviewSubmissionService reviewSubmissionService;
    private final ModeratedReviewRepository reviewRepository;

    @PostMapping("/submit")
    public ResponseEntity<ModeratedReview> submitReview(@RequestBody Map<String, Object> request) {
        Long bookId = Long.valueOf(request.get("bookId").toString());
        String userId = request.get("userId").toString();
        String reviewText = request.get("reviewText").toString();

        ModeratedReview review = reviewSubmissionService.submitReview(bookId, userId, reviewText);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<ModeratedReview>> getReviewsByBook(@PathVariable Long bookId) {
        List<ModeratedReview> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
        return ResponseEntity.ok(reviews);
    }
}
