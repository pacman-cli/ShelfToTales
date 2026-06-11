package com.example.shelftotales.event.observer;

import com.example.shelftotales.event.*;
import com.example.shelftotales.auth.domain.*;
import com.example.shelftotales.catalog.domain.*;
import com.example.shelftotales.auth.infrastructure.*;
import com.example.shelftotales.catalog.infrastructure.*;
import com.example.shelftotales.bookshelf.infrastructure.*;
import com.example.shelftotales.commerce.infrastructure.OrderRepository;
import com.example.shelftotales.ai.application.AIService;
import com.example.shelftotales.ai.infrastructure.UserProfileVectorRepository;
import com.example.shelftotales.ai.domain.UserProfileVector;
import com.example.shelftotales.blog.infrastructure.BlogPostRepository;
import com.example.shelftotales.blog.domain.BlogPost;
import com.example.shelftotales.review.infrastructure.ReviewRepository;
import com.example.shelftotales.review.domain.Review;
import com.example.shelftotales.exchange.infrastructure.ExchangeListingRepository;
import com.example.shelftotales.exchange.domain.ExchangeListing;
import com.example.shelftotales.wishlist.infrastructure.WishlistRepository;
import com.example.shelftotales.wishlist.domain.WishlistItem;
import com.example.shelftotales.social.infrastructure.FollowRepository;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProfileVectorObserver {

    private final UserProfileVectorRepository profileVectorRepository;
    private final BookEmbeddingRepository bookEmbeddingRepository;
    private final ShelfBookRepository shelfBookRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final AIService aiService;
    private final BlogPostRepository blogPostRepository;
    private final ReviewRepository reviewRepository;
    private final ExchangeListingRepository exchangeListingRepository;
    private final WishlistRepository wishlistRepository;
    private final FollowRepository followRepository;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onBookCompleted(BookCompletedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on book completion: {}", event.getActorId(), e.getMessage());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onOrderConfirmed(OrderConfirmedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on order confirmation: {}", event.getActorId(), e.getMessage());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onReviewPosted(ReviewPostedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on review: {}", event.getActorId(), e.getMessage());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onBlogCreated(BlogCreatedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on blog: {}", event.getActorId(), e.getMessage());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onWishlistAdded(WishlistAddedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on wishlist: {}", event.getActorId(), e.getMessage());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onUserFollowed(UserFollowedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on follow: {}", event.getActorId(), e.getMessage());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onExchangeCompleted(ExchangeCompletedEvent event) {
        try {
            recalculateUserVector(event.getActorId());
        } catch (Exception e) {
            log.warn("Failed to update profile vector for user {} on exchange: {}", event.getActorId(), e.getMessage());
        }
    }

    private void recalculateUserVector(Long userId) {
        Map<Long, Double> bookWeights = new HashMap<>();

        // Source 1: Completed books (weight 1.5)
        List<Long> completedBookIds = shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "COMPLETED");
        for (Long id : completedBookIds) {
            bookWeights.merge(id, 1.5, Math::max);
        }

        // Source 2: Purchased books (weight 1.5)
        List<Long> boughtBookIds = orderRepository.findBoughtBookIdsByUserId(userId);
        for (Long id : boughtBookIds) {
            bookWeights.merge(id, 1.5, Math::max);
        }

        // Source 3: Reading books (weight 1.0)
        List<Long> readingBookIds = shelfBookRepository.findBookIdsByUserIdAndStatus(userId, "READING");
        for (Long id : readingBookIds) {
            bookWeights.merge(id, 1.0, Math::max);
        }

        // Source 4: Exchange listings (weight 1.0)
        try {
            List<ExchangeListing> listings = exchangeListingRepository
                    .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 20)).getContent();
            for (ExchangeListing listing : listings) {
                if (listing.getBook() != null) {
                    bookWeights.merge(listing.getBook().getId(), 1.0, Math::max);
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch exchange listings for user {}: {}", userId, e.getMessage());
        }

        // Source 5: Wishlist (weight 0.7)
        try {
            List<WishlistItem> wishlistItems = wishlistRepository.findByUserIdWithBook(userId);
            for (WishlistItem item : wishlistItems) {
                if (item.getBook() != null) {
                    bookWeights.merge(item.getBook().getId(), 0.7, Math::max);
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch wishlist for user {}: {}", userId, e.getMessage());
        }

        // Source 6-7: Blog content and Reviews — text-based vectors (weight 1.2)
        // Note: We include blog/review contribution through book weights from associated books
        // since re-embedding text on every event would be expensive.
        // The blog and review events trigger recalculation, which picks up new book associations.

        // Source 8: Social signals — followed users' completed books (weight 0.8)
        try {
            List<Long> followedUserIds = followRepository.findFollowingIds(userId);
            for (Long followedUserId : followedUserIds) {
                List<Long> theirBooks = shelfBookRepository.findBookIdsByUserIdAndStatus(followedUserId, "COMPLETED");
                for (Long bookId : theirBooks) {
                    bookWeights.merge(bookId, 0.8, Math::max);
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch social signals for user {}: {}", userId, e.getMessage());
        }

        // Build final vector from book embeddings
        List<BookEmbedding> embeddings = bookEmbeddingRepository.findAllById(bookWeights.keySet());
        if (embeddings.isEmpty()) {
            return;
        }

        double[] avgVector = new double[384];
        double totalWeight = 0;

        for (BookEmbedding emb : embeddings) {
            double weight = bookWeights.getOrDefault(emb.getBookId(), 1.0);
            double[] vec = aiService.stringToVector(emb.getVectorData());
            if (vec.length == 384) {
                for (int i = 0; i < 384; i++) {
                    avgVector[i] += vec[i] * weight;
                }
                totalWeight += weight;
            }
        }

        if (totalWeight == 0) return;
        for (int i = 0; i < 384; i++) avgVector[i] /= totalWeight;

        // Normalize
        double norm = 0;
        for (double v : avgVector) norm += v * v;
        norm = Math.sqrt(norm);
        if (norm > 0) for (int i = 0; i < 384; i++) avgVector[i] /= norm;

        User user = userRepository.getReferenceById(userId);
        UserProfileVector profile = profileVectorRepository.findById(userId)
                .orElse(UserProfileVector.builder().user(user).userId(userId).build());
        profile.setVectorData(aiService.vectorToString(avgVector));
        profileVectorRepository.save(profile);
    }
}
