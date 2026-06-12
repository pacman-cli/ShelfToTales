package com.example.shelftotales.ai.infrastructure;

import com.example.shelftotales.ai.domain.BookChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookChunkRepository extends JpaRepository<BookChunk, Long> {

    List<BookChunk> findByBookIdOrderByChunkIndexAsc(Long bookId);

    @Query(value = "SELECT bc.* FROM book_chunks bc " +
            "ORDER BY (CASE WHEN :useVector = true AND bc.embedding IS NOT NULL " +
            "             THEN 1 - (bc.embedding <=> CAST(:queryVector AS vector)) " +
            "             ELSE 0 END) DESC, bc.id ASC " +
            "LIMIT :limit", nativeQuery = true)
    List<BookChunk> searchVector(@Param("queryVector") String queryVector,
                                 @Param("useVector") boolean useVector,
                                 @Param("limit") int limit);
}
