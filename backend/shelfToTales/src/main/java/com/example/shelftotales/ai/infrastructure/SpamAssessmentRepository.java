package com.example.shelftotales.ai.infrastructure;

import com.example.shelftotales.ai.domain.SpamAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpamAssessmentRepository extends JpaRepository<SpamAssessment, Long> {

    Optional<SpamAssessment> findByReviewId(Long reviewId);
}
