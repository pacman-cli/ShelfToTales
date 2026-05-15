package com.example.shelftotales.repository;

import com.example.shelftotales.model.ShelfBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShelfBookRepository extends JpaRepository<ShelfBook, Long> {
    @Query("SELECT sb FROM ShelfBook sb JOIN FETCH sb.book WHERE sb.bookshelf.id = :shelfId ORDER BY sb.addedAt ASC")
    List<ShelfBook> findByBookshelfIdWithBook(@Param("shelfId") Long shelfId);

    Optional<ShelfBook> findByBookshelfIdAndBookId(Long shelfId, Long bookId);
    boolean existsByBookshelfIdAndBookId(Long shelfId, Long bookId);
    int countByBookshelfId(Long shelfId);
    void deleteByBookshelfIdAndBookId(Long shelfId, Long bookId);
}
