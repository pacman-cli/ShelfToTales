package com.example.shelftotales.ai.infrastructure;

import com.example.shelftotales.ai.domain.SpoilerAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpoilerAssessmentRepository extends JpaRepository<SpoilerAssessment, Long> {

    Optional<SpoilerAssessment> findByReviewId(Long reviewId);

    @Query("SELECT sa FROM SpoilerAssessment sa WHERE sa.reviewId IN :reviewIds")
    List<SpoilerAssessment> findByReviewIds(@Param("reviewIds") List<Long> reviewIds);
}
