package com.example.shelftotales.review.infrastructure;

import com.example.shelftotales.review.domain.ModeratedReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModeratedReviewRepository extends JpaRepository<ModeratedReview, Long> {

    List<ModeratedReview> findByBookIdOrderByCreatedAtDesc(Long bookId);

    List<ModeratedReview> findByUserIdOrderByCreatedAtDesc(String userId);
}
