package com.example.shelftotales.repository;

import com.example.shelftotales.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE " +
            "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:categoryId IS NULL OR b.category.id = :categoryId)")
    Page<Book> searchBooks(@Param("query") String query,
                           @Param("categoryId") Long categoryId,
                           Pageable pageable);

    @Query(value = "SELECT * FROM books b WHERE " +
           "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', CAST(:query AS VARCHAR), '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', CAST(:query AS VARCHAR), '%'))) AND " +
           "(:categoryId IS NULL OR b.category_id = :categoryId)",
           countQuery = "SELECT COUNT(*) FROM books b WHERE " +
           "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', CAST(:query AS VARCHAR), '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', CAST(:query AS VARCHAR), '%'))) AND " +
           "(:categoryId IS NULL OR b.category_id = :categoryId)",
           nativeQuery = true)
    Page<Book> searchBooksNative(@Param("query") String query,
                                  @Param("categoryId") Long categoryId,
                                  Pageable pageable);

    Optional<Book> findByIdAndPdfUrlIsNotNull(Long id);
}
