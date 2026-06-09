package com.example.shelftotales.comparison.infrastructure;

import com.example.shelftotales.comparison.domain.ComparisonItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComparisonRepository extends JpaRepository<ComparisonItem, Long> {
    @Query("SELECT c FROM ComparisonItem c JOIN FETCH c.book WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<ComparisonItem> findByUserIdWithBook(@Param("userId") Long userId);

    Optional<ComparisonItem> findByUserIdAndBookId(Long userId, Long bookId);
    
    void deleteByUserIdAndBookId(Long userId, Long bookId);

    void deleteByUserId(Long userId);

    long countByUserId(Long userId);
}
