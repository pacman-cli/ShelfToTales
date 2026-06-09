package com.example.shelftotales.social.infrastructure;

import com.example.shelftotales.social.domain.SharedQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SharedQuoteRepository extends JpaRepository<SharedQuote, Long> {
    List<SharedQuote> findByBookIdOrderByCreatedAtDesc(Long bookId);
    List<SharedQuote> findByUserIdOrderByCreatedAtDesc(Long userId);
}
