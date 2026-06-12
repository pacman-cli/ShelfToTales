package com.example.shelftotales.review.application;

import com.example.shelftotales.ai.application.SpoilerDetectionService;
import com.example.shelftotales.ai.application.SpamDetectionService;
import com.example.shelftotales.ai.domain.SpoilerLevel;
import com.example.shelftotales.ai.domain.SpamLevel;
import com.example.shelftotales.review.application.ReviewRequest;
import com.example.shelftotales.review.application.ReviewResponse;
import com.example.shelftotales.event.ReviewPostedEvent;
import com.example.shelftotales.catalog.domain.Book;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.auth.domain.User;
import com.example.shelftotales.catalog.infrastructure.BookRepository;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.auth.infrastructure.UserRepository;
import com.example.shelftotales.shared.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final SpoilerDetectionService spoilerDetectionService;
    private final SpamDetectionService spamDetectionService;

    @Transactional
    public ReviewResponse addReview(Long bookId, ReviewRequest request) {
        User user = AuthUtils.getCurrentUser(userRepository);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        // Check if user has already reviewed the book
        reviewRepository.findByBookIdAndUserId(bookId, user.getId()).ifPresent(r -> {
            throw new IllegalArgumentException("You have already reviewed this book");
        });

        // Author opt-in: if user marked it as a spoiler, force MAJOR.
        SpoilerLevel initialLevel = request.isSpoiler()
                ? SpoilerLevel.MAJOR_SPOILER
                : SpoilerLevel.SAFE;

        Review review = Review.builder()
                .book(book)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .isSpoiler(initialLevel != SpoilerLevel.SAFE)
                .spoilerLevel(initialLevel)
                .isSpam(false)
                .spamLevel(SpamLevel.SAFE)
                .build();

        Review savedReview = reviewRepository.save(review);

        // Run spoiler detection (heuristic or LLM depending on config). If the
        // service downgrades a flagged review to SAFE, the isSpoiler flag follows.
        try {
            var assessment = spoilerDetectionService.assessAndPersist(
                    savedReview.getId(), user.getId(), bookId, request.getComment());
            savedReview.setSpoilerLevel(assessment.getSpoilerLevel());
            savedReview.setSpoiler(assessment.getSpoilerLevel() != SpoilerLevel.SAFE);
            reviewRepository.save(savedReview);
        } catch (RuntimeException ex) {
            // Spoiler detection must never break review submission.
        }

        // Run spam detection (LLM-based). Flags spam without blocking submission.
        try {
            var spamAssessment = spamDetectionService.assessAndPersist(
                    savedReview.getId(), user.getId(), request.getComment());
            savedReview.setSpamLevel(spamAssessment.getSpamLevel());
            savedReview.setSpam(spamAssessment.getSpamLevel() != SpamLevel.SAFE);
            savedReview.setSpamScore(spamAssessment.getSpamScore());
            reviewRepository.save(savedReview);
        } catch (RuntimeException ex) {
            // Spam detection must never break review submission.
        }

        eventPublisher.publishEvent(new ReviewPostedEvent(
                user.getId(), savedReview.getId(), book.getId(), book.getTitle()));

        return mapToReviewResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByBookId(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new IllegalArgumentException("Book not found: " + bookId);
        }
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        String username = review.getUser().getFullName();
        if (username == null || username.isBlank()) {
            username = review.getUser().getEmail();
        }

        return ReviewResponse.builder()
                .id(review.getId())
                .bookId(review.getBook().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .isSpoiler(review.isSpoiler())
                .spoilerLevel(review.getSpoilerLevel())
                .createdAt(review.getCreatedAt())
                .user(ReviewResponse.UserSummary.builder()
                        .id(review.getUser().getId())
                        .username(username)
                        .profileImageUrl(review.getUser().getProfileImageUrl())
                        .build())
                .build();
    }
}
